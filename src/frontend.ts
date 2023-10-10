import { msg_types } from "maxwell-protocol";
import {
  Offset,
  Msg,
  asOffset,
  OnMsg,
  ProtocolMsg,
  Condition,
  Code,
  Event,
  IHeaders,
  Options,
  TimeoutError,
  PromisePlus,
  Listenable,
  QueueManager,
  Connection,
  ConnectionManager,
  Master,
  SubscriptionManager,
} from "./internal";

export class Frontend extends Listenable {
  private _endpoints: string[];
  private _connectionManager: ConnectionManager;
  private _options: Options;
  private _subscriptionManager: SubscriptionManager;
  private _queueManager: QueueManager;
  private _onMsgs: Map<string, OnMsg>;
  private _pullTasks: Map<string, PromisePlus>;
  private _master: Master;
  private _connection: Connection | null;
  private _endpointIndex: number;
  private _failedToConnect: boolean;
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

    this._master = new Master(this._endpoints, this._options);
    this._connection = null;
    this._endpointIndex = -1;
    this._failedToConnect = false;
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
      console.warn(`Already subscribed: topic: ${topic}`);
      return;
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
      offset = asOffset(0);
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.commit(topic, msgs[count - 1].offset);
    }
    return msgs;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(
    path: string,
    payload?: unknown,
    headers?: IHeaders
  ): Promise<any> {
    const result = await this._waitAndRequest(
      this._createReqReq(path, payload, headers)
    );
    return JSON.parse(result.payload);
  }

  //===========================================
  // internal functions
  //===========================================

  private _connectToFrontend() {
    this._pickEndpoint().then(
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
      },
      (reason) => {
        console.error(`Failed to pick endpoint: ${reason.stack}`);
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
    this._connectionManager.release(this._connection);
    this._connection = null;
  }

  private _onConnectToFrontendDone() {
    this._failedToConnect = false;
    this._condition.notify();
    this._renewAllTask();
    this.notify(Event.ON_CONNECTED);
  }

  private _onConnectToFrontendFailed(code: Code) {
    if (code === Code.FAILED_TO_CONNECT) {
      this._failedToConnect = true;
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

  private async _pickEndpoint(): Promise<string> {
    if (this._options.masterEnabled) {
      return await this._master.pickFrontend(this._failedToConnect);
    } else {
      return Promise.resolve(this._nextEndpoint());
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
      this._onMsgs.get(topic)!(queue.lastOffset());
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
        const nextOffset = lastOffset + asOffset(1);
        this._subscriptionManager.toDoing(topic, nextOffset);
        setTimeout(
          () => this._newPullTask(topic, nextOffset),
          this._options.pullInterval
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._onMsgs.get(topic)!(lastOffset);
      })
      .catch((reason: any) => {
        if (reason instanceof TimeoutError) {
          console.debug(`Timeout occured: ${reason}, will pull again...`);
          setTimeout(() => this._newPullTask(topic, offset), 0);
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

  private async _waitAndRequest(msg: ProtocolMsg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this._connection!.request(msg).wait();
  }

  private _createPullReq(topic: string, offset: Offset) {
    return new msg_types.pull_req_t({
      topic: topic,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      offset: offset,
      limit: this._options.getLimit,
    });
  }

  private _createReqReq(path: string, payload?: unknown, headers?: IHeaders) {
    return new msg_types.req_req_t({
      path,
      payload: JSON.stringify(payload ? payload : {}),
      header: headers ? headers : {},
    });
  }
}

export default Frontend;
