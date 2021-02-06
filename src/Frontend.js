const protocol = require("maxwell-protocol");
const Action = require("./Action");
const Code = require("./Code");
const Event = require("./Event");
const Listenable = require("./Listenable");
const Condition = require("./Condition");
const SubscriptionManager = require("./SubscriptionManager");
const QueueManager = require("./QueueManager");
const TimeoutError = require("./TimeoutError");
const Master = require("./Master");

class Frontend extends Listenable {
  //===========================================
  // APIs
  //===========================================

  constructor(endpoints, connectionManager, options) {
    super();

    this._endpoints = endpoints;
    this._connectionManager = connectionManager;
    this._options = options;

    this._subscriptionManager = new SubscriptionManager();
    this._queueManager = new QueueManager(this._options.queueCapacity);
    this._callbacks = new Map();
    this._pullTasks = new Map();

    this._watchCallbacks = new Map();
    this._watchActions = new Set();

    this._connection = null;
    this._endpoint_index = -1;
    this._connectToFrontend();

    this._condition = new Condition(() => {
      return this._isConnectionOpen();
    });
  }

  close() {
    this._condition.clear();
    this._disconnectFromFrontend();
    this._deleteAllPullTasks();
    this._callbacks.clear();
    this._queueManager.clear();
    this._subscriptionManager.clear();
  }

  subscribe(topic, offset, callback) {
    if (this._subscriptionManager.has(topic)) {
      throw new Error(`Already subscribed: topic: ${topic}`);
    }
    this._subscriptionManager.addSubscription(topic, offset);
    this._callbacks.set(topic, callback);
    if (this._isConnectionOpen()) {
      this._newPullTask(topic, offset);
    }
  }

  unsubscribe(topic) {
    this._deletePullTask(topic);
    this._callbacks.delete(topic);
    this._queueManager.delete(topic);
    this._subscriptionManager.deleteSubscription(topic);
  }

  get(topic, offset, limit) {
    if (typeof offset === "undefined") {
      offset = 0;
    }
    if (typeof limit === "undefined") {
      limit = 8;
    }
    return this._queueManager.get_or_set(topic).getFrom(offset, limit);
  }

  commit(topic, offset) {
    if (typeof offset === "undefined") {
      this._queueManager.get_or_set(topic).deleteFirst();
    } else {
      this._queueManager.get_or_set(topic).deleteTo(offset);
    }
  }

  receive(topic, offset, limit) {
    let msgs = this.get(topic, offset, limit);
    let count = msgs.length;
    if (count > 0) {
      this.commit(topic, msgs[count - 1].offset);
    }
    return msgs;
  }

  async do(action, params = {}) {
    let result = await this._wait_and_request(
      this._createDoReq(action, params)
    );
    return JSON.parse(result.value);
  }

  watch(actionType, callback) {
    this._watchActions.add(actionType);
    this._watchCallbacks.set(actionType, callback);
    if (this._isConnectionOpen()) {
      this._ensureWatched(actionType);
    }
  }

  unwatch(actionType) {
    this._watchActions.delete(actionType);
    this._watchCallbacks.delete(actionType);
    if (this._isConnectionOpen()) {
      this._ensureUnwatched(actionType);
    }
  }

  //===========================================
  // internal functions
  //===========================================

  _connectToFrontend() {
    this._resolveEndpoint().then(
      (endpoint) => {
        this._connection = this._connectionManager.fetch(endpoint);
        this._connection.addListener(
          Event.ON_CONNECTED,
          this._onConnectToFrontendDone.bind(this)
        );
        this._connection.addListener(
          Event.ON_ERROR,
          this._onConnectToFrontendFailed.bind(this)
        );
        this._connection.addListener(
          Event.ON_DISCONNECTED,
          this._onDisconnectFromFrontendDone.bind(this)
        );
        this._connection.addListener(
          Event.ON_MESSAGE,
          this._onAction.bind(this)
        );
      },
      (reason) => {
        console.error(`Failed to resolve endpoint: ${reason.stack}`);
        setTimeout(() => this._connectToFrontend(), 1000);
      }
    );
  }

  _disconnectFromFrontend() {
    if (!this._connection) {
      return;
    }
    this._connection.deleteListener(
      Event.ON_CONNECTED,
      this._onConnectToFrontendDone.bind(this)
    );
    this._connection.deleteListener(
      Event.ON_ERROR,
      this._onConnectToFrontendFailed.bind(this)
    );
    this._connection.deleteListener(
      Event.ON_DISCONNECTED,
      this._onDisconnectFromFrontendDone.bind(this)
    );
    this._connection.deleteListener(
      Event.ON_MESSAGE,
      this._onAction.bind(this)
    );
    this._connectionManager.release(this._connection);
    this._connection = null;
  }

  _onConnectToFrontendDone() {
    this._condition.notify();
    this._renewAllTask();
    this._rewatch_all();
    this.notify(Event.ON_CONNECTED);
  }

  _onConnectToFrontendFailed(code) {
    if (code === Code.FAILED_TO_CONNECT) {
      this._disconnectFromFrontend();
      setTimeout(() => this._connectToFrontend(), 1000);
    }
  }

  _onDisconnectFromFrontendDone() {
    this._deleteAllPullTasks();
    this.notify(Event.ON_DISCONNECTED);
  }

  _isConnectionOpen() {
    return this._connection && this._connection.isOpen();
  }

  async _resolveEndpoint() {
    if (!this._options.masterEnabled) {
      return Promise.resolve(this._nextEndpoint());
    }

    let master = new Master(
      this._endpoints,
      this._connectionManager,
      this._options
    );
    try {
      return await master.resolveFrontend();
    } finally {
      master.close();
    }
  }

  _nextEndpoint() {
    this._endpoint_index += 1;
    if (this._endpoint_index >= this._endpoints.length) {
      this._endpoint_index = 0;
    }
    return this._endpoints[this._endpoint_index];
  }

  _renewAllTask() {
    this._subscriptionManager.toPendings();
    for (let p of this._subscriptionManager.getAllPendings()) {
      this._newPullTask(p[0], p[1]);
    }
  }

  _newPullTask(topic, offset) {
    this._deletePullTask(topic);

    if (!this._isValidSubscription(topic)) {
      console.debug(`Already unsubscribed: ${topic}`);
      return;
    }

    let queue = this._queueManager.get_or_set(topic);
    if (queue.isFull()) {
      console.warn(`Queue is full(${queue.size()}), waiting for consuming...`);
      setTimeout(() => this._newPullTask(topic, offset), 1000);
      return;
    }

    let pullTask = this._connection
      .request(this._createPullReq(topic, offset), 5000)
      .then((value) => {
        if (!this._isValidSubscription(topic)) {
          console.debug(`Already unsubscribed: ${topic}`);
          return;
        }
        queue.put(value.msgs);
        let lastOffset = queue.lastOffset();
        let nextOffset = lastOffset + 1;
        this._subscriptionManager.toDoing(topic, nextOffset);
        setTimeout(
          () => this._newPullTask(topic, nextOffset),
          this._options.pullInterval
        );
        this._callbacks.get(topic)(lastOffset);
      })
      .catch((reason) => {
        if (reason instanceof TimeoutError) {
          console.debug(`Timeout occured: ${reason}, will pull again...`);
          setTimeout(() => this._newPullTask(topic, offset), 1000);
        } else {
          console.error(`Error occured: ${reason.stack}, will pull again...`);
          setTimeout(() => this._newPullTask(topic, offset), 1000);
        }
      });
    this._pullTasks.set(topic, pullTask);
  }

  _deletePullTask(topic) {
    let task = this._pullTasks.get(topic);
    if (typeof task !== "undefined") {
      task.cancel();
      this._pullTasks.delete(topic);
    }
  }

  _deleteAllPullTasks() {
    for (let task of this._pullTasks.values()) {
      task.cancel();
    }
    this._pullTasks.clear();
  }

  _isValidSubscription(topic) {
    return (
      this._subscriptionManager.has(topic) &&
      this._queueManager.has(topic) &&
      this._callbacks.has(topic)
    );
  }

  _ensureWatched(actionType) {
    this._wait_and_request(this._createWatchReq(actionType)).catch((reason) => {
      console.error(`Error occured: ${reason.stack}, will watch again...`);
      setTimeout(() => this._ensureWatched(actionType), 1000);
    });
  }

  _ensureUnwatched(actionType) {
    this._wait_and_request(this._createUnwatchReq(actionType)).catch(
      (reason) => {
        console.error(`Error occured: ${reason.stack}, will unwatch again...`);
        setTimeout(() => this._ensureUnwatched(actionType), 1000);
      }
    );
  }

  _rewatch_all() {
    for (let actionType of this._watchActions) {
      this._ensureWatched(actionType);
    }
  }

  _onAction(action) {
    if (action.__proto__.$type !== protocol.do_req_t) {
      logger.error("Ignored action: %s", action);
      return;
    }
    let callback = this._watchCallbacks.get(action.type);
    if (callback !== undefined) {
      try {
        callback(new Action(action, this._connection));
      } catch (e) {
        console.error(`Failed to notify: ${e.stack}`);
      }
    }
  }

  async _wait_and_request(msg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    return await this._connection.request(msg).wait();
  }

  _createPullReq(topic, offset) {
    return protocol.pull_req_t.create({
      topic: topic,
      offset: offset,
      limit: this._options.getLimit,
    });
  }

  _createDoReq(action, params = {}) {
    let doReq = protocol.do_req_t.create({
      type: action.type,
      value: JSON.stringify(action.value ? action.value : {}),
      traces: [protocol.trace_t.create()],
    });
    if (params.sourceEnabled) {
      doReq.sourceEnabled = true;
    }
    return doReq;
  }

  _createWatchReq(actionType) {
    return protocol.watch_req_t.create({ type: actionType });
  }

  _createUnwatchReq(actionType) {
    return protocol.unwatch_req_t.create({ type: actionType });
  }
}

module.exports = Frontend;
