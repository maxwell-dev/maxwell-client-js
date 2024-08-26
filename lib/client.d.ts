import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Offset, Headers, Options, ConsumerKey, IConsumer, FunctionConsumer } from "./internal";
export declare class Client {
    private _endpoints;
    private _options;
    private _masterClient;
    private _wsChannel;
    private static _instance;
    constructor(endpoints: string[], options?: Options);
    static create(endpoints: string[], options?: Options): Client;
    static get instance(): Client;
    close(): void;
    ws(path: string, payload?: unknown, headers?: Headers): AbortablePromise<any>;
    requestViaWs(path: string, payload?: unknown, headers?: Headers): AbortablePromise<any>;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key: ConsumerKey): boolean;
    addConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    deleteConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
}
export default Client;
