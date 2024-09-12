import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
import { Offset, IConsumer, FunctionConsumer, ConsumerKey, RequestOptions } from "./";
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
    ws(path: string, options?: RequestOptions): AbortablePromise<any>;
    request(path: string, options?: RequestOptions): AbortablePromise<any>;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key: ConsumerKey): boolean;
    addConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    deleteConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
}
export default Client;
