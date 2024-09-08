import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options, buildOptions, ws, http } from "./internal";

export class Client {
  private _options: Required<Options>;
  private _httpRequester: http.Requester;
  private _wsRequester: ws.Requester;
  private _subscriberManager: ws.SubscriberManager;
  private static _instance: Client | undefined;

  constructor(endpoints: string[], options?: Options) {
    this._options = buildOptions(options);
    this._httpRequester = new http.Requester(endpoints, this._options);
    this._wsRequester = new ws.Requester(endpoints, this._options);
    this._subscriberManager = new ws.SubscriberManager(
      endpoints,
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
    this._httpRequester.close();
    this._wsRequester.close();
    this._subscriberManager.close();
  }

  get(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.get(path, options);
  }

  delete(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.delete(path, options);
  }

  head(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.head(path, options);
  }

  options(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.options(path, options);
  }

  post(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.post(path, options);
  }

  put(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.put(path, options);
  }

  patch(path: string, options?: http.RequestOptions): AbortablePromise<any> {
    return this._httpRequester.patch(path, options);
  }

  requestViaHttp(
    path: string,
    options?: http.RequestOptions,
  ): AbortablePromise<any> {
    return this._httpRequester.request(path, options);
  }

  ws(
    path: string,
    payload?: unknown,
    headers?: ws.Headers,
    roundTimeout?: number,
  ): AbortablePromise<any> {
    return this._wsRequester.request(path, payload, headers, roundTimeout);
  }

  requestViaWs(
    path: string,
    payload?: unknown,
    headers?: ws.Headers,
    roundTimeout?: number,
  ): AbortablePromise<any> {
    return this._wsRequester.request(path, payload, headers, roundTimeout);
  }

  subscribe(
    topic: string,
    offset: number,
    consumer: ws.IConsumer | ws.FunctionConsumer,
  ): boolean {
    return this._subscriberManager.subscribe(topic, offset, consumer);
  }

  unsubscribe(topic: string, key: ws.ConsumerKey): boolean {
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
