import {
  IOptions,
  Options,
  ConnectionManager,
  Frontend,
  IHeaders,
  Msg,
  Offset,
  OnMsg,
} from "./internal";

const globalWithMaxwellClient = globalThis as unknown as {
  maxwellClient: Client | undefined;
};

export class Client {
  private _endpoints: string[];
  private _options: Options;
  private _connectionManager: ConnectionManager;
  private _frontend: Frontend;

  constructor(endpoints: string[], options?: IOptions) {
    this._endpoints = endpoints;
    this._options = new Options(options);
    this._connectionManager = new ConnectionManager(this._options);
    this._frontend = new Frontend(
      this._endpoints,
      this._connectionManager,
      this._options
    );
  }

  close(): void {
    this._frontend.close();
    this._connectionManager.close();
  }

  static singleton(endpoints: string[], options?: IOptions): Client {
    if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
      globalWithMaxwellClient.maxwellClient = new Client(endpoints, options);
    }
    return globalWithMaxwellClient.maxwellClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(
    path: string,
    payload?: unknown,
    headers?: IHeaders
  ): Promise<any> {
    return await this._frontend.request(path, payload, headers);
  }

  subscribe(topic: string, offset: Offset, onMsg: OnMsg): void {
    this._frontend.subscribe(topic, offset, onMsg);
  }

  unsubscribe(topic: string): void {
    this._frontend.unsubscribe(topic);
  }

  get(topic: string, offset: Offset, limit: number): Msg[] {
    return this._frontend.get(topic, offset, limit);
  }

  commit(topic: string, offset: Offset): void {
    this._frontend.commit(topic, offset);
  }

  receive(topic: string, offset: Offset, limit: number): Msg[] {
    return this._frontend.receive(topic, offset, limit);
  }
}

export default Client;
