import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
import { Headers, Offset, IConsumer, FunctionConsumer, ConsumerKey } from "./";
export declare class Client {
    private _endpoints;
    private _options;
    private _requester;
    private _subscriberManager;
    private static _instance;
    constructor(endpoints: string[], options?: Options);
    static create(endpoints: string[], options?: Options): Client;
    static get instance(): Client;
    close(): void;
    ws(path: string, payload?: unknown, headers?: Headers, roundTimeout?: number): AbortablePromise<any>;
    request(path: string, payload?: unknown, headers?: Headers, roundTimeout?: number): AbortablePromise<any>;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key: ConsumerKey): boolean;
    addConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    deleteConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
}
export default Client;
