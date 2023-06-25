import { IOptions, IHeaders, Msg, Offset, OnMsg } from "./internal";
export declare class Client {
    private _endpoints;
    private _options;
    private _connectionManager;
    private _frontend;
    private static _instance;
    constructor(endpoints: string[], options?: IOptions);
    close(): void;
    static singleton(endpoints: string[], options?: IOptions): Client;
    request(path: string, payload?: unknown, headers?: IHeaders): Promise<any>;
    subscribe(topic: string, offset: Offset, onMsg: OnMsg): void;
    unsubscribe(topic: string): void;
    get(topic: string, offset: Offset, limit: number): Msg[];
    commit(topic: string, offset: Offset): void;
    receive(topic: string, offset: Offset, limit: number): Msg[];
}
export default Client;
