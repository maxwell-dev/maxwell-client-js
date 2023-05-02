import {
  IOptions,
  Options,
  ConnectionManager,
  Frontend,
  Subscriber,
  Requester,
} from "./internal";

export class Client {
  private _endpoints: string[];
  private _options: Options;
  private _connectionManager: ConnectionManager;
  private _frontend: Frontend | null;
  private _requester: Requester | null;
  private _subscriber: Subscriber | null;

  constructor(endpoints: string[], options?: IOptions) {
    this._endpoints = endpoints;
    this._options = new Options(options);
    this._connectionManager = new ConnectionManager(this._options);
    this._frontend = null;
    this._requester = null;
    this._subscriber = null;
  }

  close(): void {
    this._frontend?.close();
    this._connectionManager.close();
  }

  getRequester(): Requester {
    this._ensureRequesterInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._requester!;
  }

  getSubscriber(): Subscriber {
    this._ensureSubscriberInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._subscriber!;
  }

  private _ensureRequesterInited() {
    if (this._requester === null) {
      this._ensureFrontendInited();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._requester = new Requester(this._frontend!);
    }
  }

  private _ensureSubscriberInited() {
    if (this._subscriber === null) {
      this._ensureFrontendInited();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._subscriber = new Subscriber(this._frontend!);
    }
  }

  private _ensureFrontendInited() {
    if (this._frontend === null) {
      this._frontend = new Frontend(
        this._endpoints,
        this._connectionManager,
        this._options
      );
    }
  }
}

export default Client;
