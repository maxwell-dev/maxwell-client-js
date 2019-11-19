const protocol = require('maxwell-protocol');
const Code = require('./Code');
const Event = require('./Event');
const Listenable = require('./Listenable');
const Condition = require('./Condition');
const SubscriptionManager = require('./SubscriptionManager');
const QueueManager = require('./QueueManager');
const TimeoutError = require('./TimeoutError');
const Master = require('./Master');

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
    if (this._subscriptionManager.hasSubscribed(topic)) {
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
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    if (typeof limit === 'undefined') {
      limit = 8;
    }
    return this._queueManager.get(topic).getFrom(offset, limit);
  }

  commit(topic, offset) {
    if (typeof offset === 'undefined') {
      this._queueManager.get(topic).deleteFirst();
    } else {
      this._queueManager.get(topic).deleteTo(offset);
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

  //===========================================
  // internal functions
  //===========================================

  _connectToFrontend() {
    this._resolveEndpoint().then(endpoint => {
      this._connection = this._connectionManager.fetch(endpoint);
      this._connection.addListener(
          Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
      this._connection.addListener(
          Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
      this._connection.addListener(
          Event.ON_DISCONNECTED,
          this._onDisconnectFromFrontendDone.bind(this));
    }, reason => {
      console.error(`Failed to resolve endpoint: ${reason.stack}`);
      setTimeout(() => this._connectToFrontend(), 1000);
    });
  }

  _disconnectFromFrontend() {
    if (!this._connection) {
      return;
    }
    this._connection.deleteListener(
        Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
    this._connection.deleteListener(
        Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
    this._connection.deleteListener(
        Event.ON_DISCONNECTED, 
        this._onDisconnectFromFrontendDone.bind(this));
    this._connectionManager.release(this._connection);
    this._connection = null;
  }

  _onConnectToFrontendDone() {
    this._condition.notify();
    this._renewAllTask();
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
        this._endpoints, this._connectionManager, this._options
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
    if (!this._subscriptionManager.hasSubscribed(topic)) {
      return;
    }
    let queue = this._queueManager.get(topic);
    let callback = this._callbacks.get(topic);
    if (queue.isFull()) {
      console.log(
          `Queue is full(${queue.size()}), waiting for consuming...`
      );
      setTimeout(() => this._newPullTask(topic, offset), 100);
      return;
    }

    let pullTask = this._connection.send(this._createPullReq(topic, offset), 5000)
        .then(value => {
          queue.put(value.msgs);
          let lastOffset = queue.lastOffset();
          let nextOffset = lastOffset + 1;
          this._subscriptionManager.toDoing(topic, nextOffset);
          setTimeout(() => this._newPullTask(topic, nextOffset), 10);
          callback(lastOffset);
        })
        .catch(reason => {
          if (reason instanceof TimeoutError) {
            console.debug(`Timeout occured: ${reason}, will pull again...`);
            setTimeout(() => this._newPullTask(topic, offset), 10);
          } else {
            console.error(`Error occured: ${reason.stack}, will pull again...`);
            setTimeout(() => this._newPullTask(topic, offset), 1000);
          }
        });
    this._pullTasks.set(topic, pullTask);
  }

  _deletePullTask(topic) {
    let task = this._pullTasks.get(topic);
    if (typeof task !== 'undefined') {
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

  async _wait_and_request(msg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    return await this._connection.send(msg).wait(); 
  }

  _createPullReq(topic, offset) {
    return protocol.pull_req_t.create({
      topic: topic,
      offset: offset,
      limit: this._options.getLimit
    });
  }

  _createDoReq(action, params = {}) {
    let do_req = protocol.do_req_t.create({
      type: action.type,
      value: JSON.stringify(action.value ? action.value : {}),
      traces: [protocol.trace_t.create()]
    });
    if (params.sourceEnabled) {
      do_req.sourceEnabled = true;
    }
    return do_req;
  }

}

module.exports = Frontend;
