import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import {
  Offset,
  Headers,
  Options,
  defaultOptions,
  ConsumerKey,
  IConsumer,
  FunctionConsumer,
  WsChannel,
  MasterClient,
} from "./internal";

export class Client {
  private _endpoints: string[];
  private _options: Required<Options>;
  private _masterClient: MasterClient;
  private _wsChannel: WsChannel;
  private static _instance: Client | undefined;

  constructor(endpoints: string[], options?: Options) {
    this._endpoints = endpoints;
    this._options = defaultOptions(options);
    this._masterClient = new MasterClient(this._endpoints, this._options);
    this._wsChannel = new WsChannel(this._masterClient, this._options);
  }

  static create(endpoints: string[], options?: Options): Client {
    if (typeof Client._instance === "undefined") {
      Client._instance = new Client(endpoints, options);
    }
    return Client._instance;
  }

  static get instance(): Client {
    if (typeof Client._instance === "undefined") {
      throw new Error("The instance has not initialized yet!");
    }
    return Client._instance;
  }

  close(): void {
    this._wsChannel.close();
  }

  ws(
    path: string,
    payload?: unknown,
    headers?: Headers,
  ): AbortablePromise<any> {
    return this._wsChannel.request(path, payload, headers);
  }

  requestViaWs(
    path: string,
    payload?: unknown,
    headers?: Headers,
  ): AbortablePromise<any> {
    return this._wsChannel.request(path, payload, headers);
  }

  subscribe(
    topic: string,
    offset: Offset,
    consumer: IConsumer | FunctionConsumer,
  ): boolean {
    return this._wsChannel.subscribe(topic, offset, consumer);
  }

  unsubscribe(topic: string, key: ConsumerKey): boolean {
    return this._wsChannel.unsubscribe(topic, key);
  }

  addConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._wsChannel.addListener(event, listener);
  }

  deleteConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._wsChannel.deleteListener(event, listener);
  }
}

export default Client;
