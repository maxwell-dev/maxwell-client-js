import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { msg_types } from "maxwell-protocol";
import {
  Event,
  IEventHandler,
  Listenable,
  MultiAltEndpointsConnection,
  IConnection,
} from "maxwell-utils";

import {
  Offset,
  Headers,
  Options,
  MasterClient,
  FunctionConsumer,
  IConsumer,
  ConsumerKey,
  SubscriberManager,
} from "./internal";

export class WsChannel extends Listenable implements IEventHandler {
  private _masterClient: MasterClient;
  private _options: Required<Options>;
  private _connection: MultiAltEndpointsConnection;
  private _failedToConnect: boolean;
  private _subscriberManager: SubscriberManager;

  //===========================================
  // APIs
  //===========================================

  constructor(masterClient: MasterClient, options: Required<Options>) {
    super();
    this._masterClient = masterClient;
    this._options = options;
    this._connection = new MultiAltEndpointsConnection(
      this._pickEndpoint.bind(this),
      this._options,
      this,
    );
    this._failedToConnect = false;
    this._subscriberManager = new SubscriberManager(
      this._connection,
      this._options,
    );
  }

  close(): void {
    this._connection.close();
  }

  request(
    path: string,
    payload?: unknown,
    headers?: Headers,
  ): AbortablePromise<any> {
    if (this._connection.isOpen()) {
      return this._connection
        .request(
          this._createReqReq(path, payload, headers),
          this._options.roundTimeout,
        )
        .then((result) => {
          return JSON.parse(result.payload);
        });
    } else {
      return this._connection
        .waitOpen(this._options.waitOpenTimeout)
        .then((connection) => {
          return connection
            .request(
              this._createReqReq(path, payload, headers),
              this._options.roundTimeout,
            )
            .then((result) => {
              return JSON.parse(result.payload);
            });
        });
    }
  }

  subscribe(
    topic: string,
    offset: Offset,
    consumer: IConsumer | FunctionConsumer,
  ): boolean {
    return this._subscriberManager.subscribe(topic, offset, consumer);
  }

  unsubscribe(topic: string, key?: ConsumerKey): boolean {
    return this._subscriberManager.unsubscribe(topic, key);
  }

  //===========================================
  // IEventHandler implementation
  //===========================================

  onConnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_CONNECTING, connection, ...rest);
  }

  onConnected(connection: IConnection, ...rest: any[]): void {
    this._failedToConnect = false;
    this.notify(Event.ON_CONNECTED, connection, ...rest);
  }

  onDisconnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_DISCONNECTING, connection, ...rest);
  }

  onDisconnected(connection: IConnection, ...rest: any[]): void {
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
    return this._masterClient.pickFrontend(this._failedToConnect);
  }

  private _createReqReq(
    path: string,
    payload?: unknown,
    headers?: Headers,
  ): typeof msg_types.req_req_t.prototype {
    return new msg_types.req_req_t({
      path,
      payload: JSON.stringify(payload ? payload : {}),
      header: headers ? headers : {},
    });
  }
}

export default WsChannel;
