import { msg_types } from "maxwell-protocol";
import IAction from "./IAction";
import Code from "./Code";
import Event from "./Event";
import Listenable from "./Listenable";
import PromisePlus from "./PromisePlus";
import Condition from "./Condition";
import { OnAction, OnMsg, ProtocolMsg } from "./types";
import SubscriptionManager from "./SubscriptionManager";
import QueueManager from "./QueueManager";
import TimeoutError from "./TimeoutError";
import Master from "./Master";
import ConnectionManager from "./ConnectionManager";
import Options from "./Options";
import Connection from "./Connection";
import ActionHandler from "./ActionHandler";
import { Msg, Offset } from "./types";
import IHeaders from "./IHeaders";

export class Frontend extends Listenable {
  private _endpoints: string[];
  private _connectionManager: ConnectionManager;
  private _options: Options;
  private _subscriptionManager: SubscriptionManager;
  private _queueManager: QueueManager;
  private _onMsgs: Map<string, OnMsg>;
  private _pullTasks: Map<string, PromisePlus>;
  private _onActions: Map<string, OnAction>;
  private _watchActions: Set<string>;
  private _connection: Connection | null;
  private _endpointIndex: number;
  private _condition: Condition;

  //===========================================
  // APIs
  //===========================================

  constructor(
    endpoints: string[],
    connectionManager: ConnectionManager,
    options: Options
  ) {
    super();

    this._endpoints = endpoints;
    this._connectionManager = connectionManager;
    this._options = options;

    this._subscriptionManager = new SubscriptionManager();
    this._queueManager = new QueueManager(this._options.queueCapacity || 1024);
    this._onMsgs = new Map();
    this._pullTasks = new Map();

    this._onActions = new Map();
    this._watchActions = new Set();

    this._connection = null;
    this._endpointIndex = -1;
    this._connectToFrontend();

    this._condition = new Condition(() => {
      return this._isConnectionOpen();
    });
  }

  close(): void {
    this._condition.clear();
    this._disconnectFromFrontend();
    this._deleteAllPullTasks();
    this._onMsgs.clear();
    this._queueManager.clear();
    this._subscriptionManager.clear();
  }

  subscribe(topic: string, offset: Offset, onMsg: OnMsg): void {
    if (this._subscriptionManager.has(topic)) {
      throw new Error(`Already subscribed: topic: ${topic}`);
    }
    this._subscriptionManager.addSubscription(topic, offset);
    this._queueManager.get_or_set(topic);
    this._onMsgs.set(topic, onMsg);
    if (this._isConnectionOpen()) {
      this._newPullTask(topic, offset);
    }
  }

  unsubscribe(topic: string): void {
    this._deletePullTask(topic);
    this._onMsgs.delete(topic);
    this._queueManager.delete(topic);
    this._subscriptionManager.deleteSubscription(topic);
  }

  get(topic: string, offset: Offset, limit: number): Msg[] {
    if (typeof offset === "undefined") {
      offset = 0;
    }
    if (typeof limit === "undefined") {
      limit = 8;
    }
    return this._queueManager.get_or_set(topic).getFrom(offset, limit);
  }

  commit(topic: string, offset: Offset): void {
    if (typeof offset === "undefined") {
      this._queueManager.get_or_set(topic).deleteFirst();
    } else {
      this._queueManager.get_or_set(topic).deleteTo(offset);
    }
  }

  receive(topic: string, offset: Offset, limit: number): Msg[] {
    const msgs = this.get(topic, offset, limit);
    const count = msgs.length;
    if (count > 0) {
      this.commit(topic, msgs[count - 1].offset);
    }
    return msgs;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async do(action: IAction, headers: IHeaders = {}): Promise<any> {
    const result = await this._waitAndRequest(
      this._createDoReq(action, headers)
    );
    return JSON.parse(result.value);
  }

  watch(actionType: string, onAction: OnAction): void {
    this._watchActions.add(actionType);
    this._onActions.set(actionType, onAction);
    if (this._isConnectionOpen()) {
      this._ensureWatched(actionType);
    }
  }

  unwatch(actionType: string): void {
    this._watchActions.delete(actionType);
    this._onActions.delete(actionType);
    if (this._isConnectionOpen()) {
      this._ensureUnwatched(actionType);
    }
  }

  //===========================================
  // internal functions
  //===========================================

  private _connectToFrontend() {
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

  private _disconnectFromFrontend() {
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

  private _onConnectToFrontendDone() {
    this._condition.notify();
    this._renewAllTask();
    this._rewatch_all();
    this.notify(Event.ON_CONNECTED);
  }

  private _onConnectToFrontendFailed(code: Code) {
    if (code === Code.FAILED_TO_CONNECT) {
      this._disconnectFromFrontend();
      setTimeout(() => this._connectToFrontend(), 1000);
    }
  }

  private _onDisconnectFromFrontendDone() {
    this._deleteAllPullTasks();
    this.notify(Event.ON_DISCONNECTED);
  }

  private _isConnectionOpen() {
    return this._connection !== null && this._connection.isOpen();
  }

  private async _resolveEndpoint() {
    if (!this._options.masterEnabled) {
      return Promise.resolve(this._nextEndpoint());
    }

    const master = new Master(
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

  private _nextEndpoint() {
    this._endpointIndex += 1;
    if (this._endpointIndex >= this._endpoints.length) {
      this._endpointIndex = 0;
    }
    return this._endpoints[this._endpointIndex];
  }

  private _renewAllTask() {
    this._subscriptionManager.toPendings();
    for (const p of this._subscriptionManager.getAllPendings()) {
      this._newPullTask(p[0], p[1]);
    }
  }

  private _newPullTask(topic: string, offset: Offset) {
    this._deletePullTask(topic);

    if (!this._isValidSubscription(topic)) {
      console.debug(`Already unsubscribed: ${topic}`);
      return;
    }

    const queue = this._queueManager.get_or_set(topic);
    if (queue.isFull()) {
      console.warn(`Queue is full(${queue.size()}), waiting for consuming...`);
      setTimeout(() => this._newPullTask(topic, offset), 1000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._onMsgs.get(topic)!(offset - 1);
      return;
    }

    if (this._connection === null) {
      console.warn("Connection was lost");
      return;
    }
    const pullTask = this._connection
      .request(this._createPullReq(topic, offset), 5000)
      .then((value: typeof msg_types.pull_rep_t.prototype) => {
        if (!this._isValidSubscription(topic)) {
          console.debug(`Already unsubscribed: ${topic}`);
          return;
        }
        queue.put(value.msgs as Msg[]);
        const lastOffset = queue.lastOffset();
        const nextOffset = lastOffset + 1;
        this._subscriptionManager.toDoing(topic, nextOffset);
        setTimeout(
          () => this._newPullTask(topic, nextOffset),
          this._options.pullInterval
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._onMsgs.get(topic)!(lastOffset);
      })
      .catch((reason) => {
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

  private _deletePullTask(topic: string) {
    const task = this._pullTasks.get(topic);
    if (typeof task !== "undefined") {
      task.cancel();
      this._pullTasks.delete(topic);
    }
  }

  private _deleteAllPullTasks() {
    for (const task of this._pullTasks.values()) {
      task.cancel();
    }
    this._pullTasks.clear();
  }

  private _isValidSubscription(topic: string) {
    return (
      this._subscriptionManager.has(topic) &&
      this._queueManager.has(topic) &&
      this._onMsgs.has(topic)
    );
  }

  private _ensureWatched(actionType: string) {
    this._waitAndRequest(this._createWatchReq(actionType)).catch((reason) => {
      console.error(`Error occured: ${reason.stack}, will watch again...`);
      setTimeout(() => this._ensureWatched(actionType), 1000);
    });
  }

  private _ensureUnwatched(actionType: string) {
    this._waitAndRequest(this._createUnwatchReq(actionType)).catch((reason) => {
      console.error(`Error occured: ${reason.stack}, will unwatch again...`);
      setTimeout(() => this._ensureUnwatched(actionType), 1000);
    });
  }

  private _rewatch_all() {
    for (const actionType of this._watchActions) {
      this._ensureWatched(actionType);
    }
  }

  private _onAction(doReq: typeof msg_types.do_req_t.prototype) {
    const callback = this._onActions.get(doReq.type);
    if (callback !== undefined && this._connection !== null) {
      try {
        callback(new ActionHandler(doReq, this._connection));
      } catch (e) {
        console.error(`Failed to notify: ${e.stack}`);
      }
    }
  }

  private async _waitAndRequest(msg: ProtocolMsg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this._connection!.request(msg).wait();
  }

  private _createPullReq(topic: string, offset: Offset) {
    return new msg_types.pull_req_t({
      topic: topic,
      offset: offset,
      limit: this._options.getLimit,
    });
  }

  private _createDoReq(action: IAction, headers: IHeaders) {
    const doReq = new msg_types.do_req_t({
      type: action.type,
      value: JSON.stringify(action.value ? action.value : {}),
      traces: [new msg_types.trace_t()],
    });
    if (headers.sourceEnabled) {
      doReq.sourceEnabled = true;
    }
    return doReq;
  }

  private _createWatchReq(actionType: string) {
    return new msg_types.watch_req_t({ type: actionType });
  }

  private _createUnwatchReq(actionType: string) {
    return new msg_types.unwatch_req_t({ type: actionType });
  }
}

export default Frontend;
