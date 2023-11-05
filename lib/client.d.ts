import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { IOptions, IHeaders, Msg, Offset, OnMsg } from "./internal";
export declare class Client {
    private _endpoints;
    private _options;
    private _master;
    private _frontend;
    constructor(endpoints: string[], options?: IOptions);
    static singleton(endpoints: string[], options?: IOptions): Client;
    close(): void;
    addConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    deleteConnectionListener(event: Event, listener: (...args: unknown[]) => void): void;
    request(path: string, payload?: unknown, headers?: IHeaders): AbortablePromise<any>;
    subscribe(topic: string, offset: Offset, onMsg: OnMsg): void;
    unsubscribe(topic: string): void;
    get(topic: string, offset: Offset, limit: number): Msg[];
    commit(topic: string, offset: Offset): void;
    receive(topic: string, offset: Offset, limit: number): Msg[];
}
export default Client;
