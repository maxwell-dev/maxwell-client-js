import { AbortError, AbortablePromise } from "@xuchaoqian/abortable-promise";
import { msg_types } from "maxwell-protocol";
import {
  Event,
  IEventHandler,
  TimeoutError,
  Listenable,
  MultiAltEndpointsConnection,
  IConnection,
} from "maxwell-utils";

import {
  Offset,
  Msg,
  asOffset,
  OnMsg,
  ProtocolMsg,
  IHeaders,
  Options,
  QueueManager,
  Master,
  SubscriptionManager,
} from "./internal";

export class Frontend extends Listenable implements IEventHandler {
  private _master: Master;
  private _options: Options;

  private _subscriptionManager: SubscriptionManager;
  private _onMsgs: Map<string, OnMsg>;
  private _queueManager: QueueManager;
  private _pullTasks: Map<string, AbortablePromise<ProtocolMsg>>;

  private _connection: MultiAltEndpointsConnection;
  private _failedToConnect: boolean;

  //===========================================
  // APIs
  //===========================================

  constructor(master: Master, options: Options) {
    super();
    this._master = master;
    this._options = options;

    this._subscriptionManager = new SubscriptionManager();
    this._onMsgs = new Map();
    this._queueManager = new QueueManager(this._options.queueCapacity || 1024);
    this._pullTasks = new Map();

    this._connection = new MultiAltEndpointsConnection(
      this._pickEndpoint.bind(this),
      this._options,
      this
    );
    this._failedToConnect = false;
  }

  close(): void {
    this._deleteAllPullTasks();
    this._subscriptionManager.clear();
    this._onMsgs.clear();
    this._queueManager.clear();
    this._connection.close();
  }

  subscribe(topic: string, offset: Offset, onMsg: OnMsg): void {
    if (this._subscriptionManager.has(topic)) {
      console.info(`Already subscribed: topic: ${topic}`);
      return;
    }
    this._subscriptionManager.addSubscription(topic, offset);
    this._onMsgs.set(topic, onMsg);
    this._queueManager.get_or_set(topic);
    if (this._connection.isOpen()) {
      this._newPullTask(topic, offset);
    }
  }

  unsubscribe(topic: string): void {
    this._deletePullTask(topic);
    this._subscriptionManager.deleteSubscription(topic);
    this._onMsgs.delete(topic);
    this._queueManager.delete(topic);
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
  request(
    path: string,
    payload?: unknown,
    headers?: IHeaders
  ): AbortablePromise<any> {
    return this._connection
      .waitOpen(this._options.waitOpenTimeout)
      .then((connection) => {
        return connection
          .request(
            this._createReqReq(path, payload, headers),
            this._options.roundTimeout
          )
          .then((result) => {
            return JSON.parse(result.payload);
          });
      });
  }

  //===========================================
  // IEventHandler implementation
  //===========================================
  onConnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_CONNECTING, connection, ...rest);
  }

  onConnected(connection: IConnection, ...rest: any[]): void {
    this._failedToConnect = false;
    this._renewAllTask();
    this.notify(Event.ON_CONNECTED, connection, ...rest);
  }

  onDisconnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_DISCONNECTING, connection, ...rest);
  }

  onDisconnected(connection: IConnection, ...rest: any[]): void {
    this._deleteAllPullTasks();
    this.notify(Event.ON_DISCONNECTED, connection, ...rest);
  }

  onCorrupted(connection: IConnection, ...rest: any[]): void {
    this._failedToConnect = true;
    this.notify(Event.ON_CORRUPTED, connection, ...rest);
  }

  //===========================================
  // internal functions
  //===========================================

  private _pickEndpoint(): AbortablePromise<string> {
    return this._master.pickFrontend(this._failedToConnect);
  }

  private _renewAllTask() {
    this._subscriptionManager.toPendings();
    for (const pending of this._subscriptionManager.getAllPendings()) {
      this._newPullTask(pending[0], pending[1]);
    }
  }

  private _newPullTask(topic: string, offset: Offset) {
    if (!this._isValidSubscription(topic)) {
      console.debug(`Already unsubscribed: ${topic}`);
      return;
    }
    this._deletePullTask(topic);

    const queue = this._queueManager.get_or_set(topic);
    if (queue.isFull()) {
      console.warn(`Queue is full(${queue.size()}), waiting for consuming...`);
      setTimeout(() => this._newPullTask(topic, offset), 1000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._onMsgs.get(topic)!(queue.lastOffset());
      return;
    }

    const pullTask = this._connection
      .request(this._createPullReq(topic, offset), this._options.roundTimeout)
      .then((value: typeof msg_types.pull_rep_t.prototype) => {
        if (!this._isValidSubscription(topic)) {
          console.debug(`Already unsubscribed: ${topic}`);
          return;
        }

        if (value.msgs.length < 1) {
          console.info(`No msgs pulled: topic: ${topic}, offset: ${offset}`);
          setTimeout(
            () => this._newPullTask(topic, offset),
            this._options.pullInterval
          );
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
        } else if (reason instanceof AbortError) {
          console.debug(`Task aborted: ${reason}, stop pulling.`);
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
      task.abort();
      this._pullTasks.delete(topic);
    }
  }

  private _deleteAllPullTasks() {
    for (const task of this._pullTasks.values()) {
      task.abort();
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

  private _createPullReq(topic: string, offset: Offset) {
    return new msg_types.pull_req_t({
      topic: topic,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      offset: offset,
      limit: this._options.pullLimit,
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
