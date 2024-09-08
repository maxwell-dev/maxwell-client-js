import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
import { RequestOptions } from "./";
export declare class Client {
    private _endpoints;
    private _options;
    private _requester;
    constructor(endpoints: string[], options?: Options);
    close(): void;
    get(path: string, options?: RequestOptions): AbortablePromise<any>;
    delete(path: string, options?: RequestOptions): AbortablePromise<any>;
    head(path: string, options?: RequestOptions): AbortablePromise<any>;
    options(path: string, options?: RequestOptions): AbortablePromise<any>;
    post(path: string, options?: RequestOptions): AbortablePromise<any>;
    put(path: string, options?: RequestOptions): AbortablePromise<any>;
    patch(path: string, options?: RequestOptions): AbortablePromise<any>;
    request(path: string, options?: RequestOptions): AbortablePromise<any>;
}
