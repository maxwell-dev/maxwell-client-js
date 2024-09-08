import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
import { Channel, Headers } from "./";
export declare class Requester extends Channel {
    private readonly _connectionPool;
    constructor(endpoints: string[], options: Required<Options>);
    close(): void;
    ws(path: string, payload?: unknown, headers?: Headers, roundTimeout?: number): AbortablePromise<any>;
    request(path: string, payload?: unknown, headers?: Headers, roundTimeout?: number): AbortablePromise<any>;
    private _createReqReq;
}
