import IOptionalOptions from "./IOptionalOptions";
import Options from "./Options";
import ConnectionManager from "./ConnectionManager";
import Frontend from "./Frontend";
import Subscriber from "./Subscriber";
import Doer from "./Doer";
import Wather from "./Watcher";
import { Publisher } from "./Publisher";

export class Client {
  private _endpoints: string[];
  private _options: Options;
  private _connectionManager: ConnectionManager;
  private _frontend: Frontend | null;
  private _doer: Doer | null;
  private _watcher: Wather | null;
  private _publisher: Publisher | null;
  private _subscriber: Subscriber | null;

  constructor(endpoints: string[], options?: IOptionalOptions) {
    this._endpoints = endpoints;
    this._options = new Options(options);
    this._connectionManager = new ConnectionManager(this._options);
    this._frontend = null;
    this._doer = null;
    this._watcher = null;
    this._publisher = null;
    this._subscriber = null;
  }

  close(): void {
    this._frontend?.close();
    this._publisher?.close();
    this._connectionManager.close();
  }

  getDoer(): Doer {
    this._ensureDoerInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._doer!;
  }

  getWatcher(): Wather {
    this._ensureWatcherInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._watcher!;
  }

  getPublisher(): Publisher {
    this._ensurePublisherInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._publisher!;
  }

  getSubscriber(): Subscriber {
    this._ensureSubscriberInited();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._subscriber!;
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

  private _ensureDoerInited() {
    if (this._doer === null) {
      this._ensureFrontendInited();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._doer = new Doer(this._frontend!);
    }
  }

  private _ensureWatcherInited() {
    if (this._watcher === null) {
      this._ensureFrontendInited();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._watcher = new Wather(this._frontend!);
    }
  }

  private _ensurePublisherInited() {
    if (this._publisher === null) {
      this._publisher = new Publisher(
        this._endpoints,
        this._connectionManager,
        this._options
      );
    }
  }

  private _ensureSubscriberInited() {
    if (this._subscriber === null) {
      this._ensureFrontendInited();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._subscriber = new Subscriber(this._frontend!);
    }
  }
}

export default Client;
