import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { buildOptions, Options } from "../internal";
import {
  SubscriberManager,
  Offset,
  IConsumer,
  FunctionConsumer,
  ConsumerKey,
  Requester,
  RequestOptions,
} from "./";

export class Client {
  private _endpoints: string[];
  private _options: Required<Options>;
  private _requester: Requester;
  private _subscriberManager: SubscriberManager;
  private static _instance: Client | undefined;

  constructor(endpoints: string[], options?: Options) {
    this._endpoints = endpoints;
    this._options = buildOptions(options);
    this._requester = new Requester(this._endpoints, this._options);
    this._subscriberManager = new SubscriberManager(
      this._endpoints,
      this._options,
    );
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
    this._requester.close();
    this._subscriberManager.close();
  }

  ws(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.request(path, options);
  }

  request(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.request(path, options);
  }

  subscribe(
    topic: string,
    offset: Offset,
    consumer: IConsumer | FunctionConsumer,
  ): boolean {
    return this._subscriberManager.subscribe(topic, offset, consumer);
  }

  unsubscribe(topic: string, key: ConsumerKey): boolean {
    return this._subscriberManager.unsubscribe(topic, key);
  }

  addConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._subscriberManager.addListener(event, listener);
  }

  deleteConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._subscriberManager.deleteListener(event, listener);
  }
}

export default Client;
