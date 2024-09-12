import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
import { Channel } from "./";
export type Headers = {
    sourceEnabled?: boolean;
    agent?: string | null;
    endpoint?: string | null;
};
export type Payload = any;
export interface RequestOptions {
    headers?: Headers;
    payload?: Payload;
    waitOpenTimeout?: number;
    roundTimeout?: number;
    signal?: AbortSignal;
}
export declare class Requester extends Channel {
    private readonly _connectionPool;
    constructor(endpoints: string[], options: Required<Options>);
    close(): void;
    ws(path: string, options?: RequestOptions): AbortablePromise<any>;
    request(path: string, options?: RequestOptions): AbortablePromise<any>;
    private _createReqReq;
}
