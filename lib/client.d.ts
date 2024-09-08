import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options, ws, http } from "./internal";
export declare class Client {
    private _options;
    private _httpRequester;
    private _wsRequester;
    private _subscriberManager;
    private static _instance;
    constructor(endpoints: string[], options?: Options);
    static create(endpoints: string[], options?: Options): Client;
    static get instance(): Client;
    close(): void;
    get(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    delete(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    head(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    options(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    post(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    put(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    patch(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    requestViaHttp(path: string, options?: http.RequestOptions): AbortablePromise<any>;
    ws(path: string, payload?: unknown, headers?: ws.Headers, roundTimeout?: number): AbortablePromise<any>;
    requestViaWs(path: string, payload?: unknown, headers?: ws.Headers, roundTimeout?: number): AbortablePromise<any>;
    subscribe(topic: string, offset: number, consumer: ws.IConsumer | ws.FunctionConsumer): boolean;
    unsubscribe(topic: string, key: ws.ConsumerKey): boolean;
    addConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    deleteConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
}
export default Client;
