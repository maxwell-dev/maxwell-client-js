import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import {
  IOptions,
  Options,
  Frontend,
  IHeaders,
  Msg,
  Offset,
  OnMsg,
  Master,
} from "./internal";

const globalWithMaxwellClient = globalThis as unknown as {
  maxwellClient: Client | undefined;
};

export class Client {
  private _endpoints: string[];
  private _options: Options;
  private _master: Master;
  private _frontend: Frontend;

  constructor(endpoints: string[], options?: IOptions) {
    this._endpoints = endpoints;
    this._options = new Options(options);
    this._master = new Master(this._endpoints, this._options);
    this._frontend = new Frontend(this._master, this._options);
  }

  /** @deprecated */
  static singleton(endpoints: string[], options?: IOptions): Client {
    if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
      globalWithMaxwellClient.maxwellClient = new Client(endpoints, options);
    }
    return globalWithMaxwellClient.maxwellClient;
  }

  static createInstance(endpoints: string[], options?: IOptions): Client {
    if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
      globalWithMaxwellClient.maxwellClient = new Client(endpoints, options);
    }
    return globalWithMaxwellClient.maxwellClient;
  }

  static getInstance(): Client {
    if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
      throw new Error("The instance has not initialized yet!");
    }
    return globalWithMaxwellClient.maxwellClient;
  }

  close(): void {
    this._frontend.close();
  }

  addConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._frontend.addListener(event, listener);
  }

  deleteConnectionListener(
    event: Event,
    listener: (...args: unknown[]) => void,
  ): void {
    this._frontend.deleteListener(event, listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request(
    path: string,
    payload?: unknown,
    headers?: IHeaders,
  ): AbortablePromise<any> {
    return this._frontend.request(path, payload, headers);
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
