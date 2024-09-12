import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "../internal";
export type Method = "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH";
export type Headers = {
    [key: string]: any;
};
export type Params = {
    [key: string]: any;
} | URLSearchParams;
export type Body = any;
export type ResponseViewType = "json" | "text" | "arraybuffer" | "blob" | "bytes" | "formData" | "stream" | "response";
export interface RequestOptions {
    method?: Method;
    headers?: Headers;
    params?: Params;
    body?: Body;
    responseViewType?: ResponseViewType;
    timeout?: number;
    signal?: AbortSignal;
}
export declare class Requester {
    private _options;
    private _endpointPicker;
    constructor(endpoints: string[], options: Required<Options>);
    close(): void;
    get(path: string, options?: RequestOptions): AbortablePromise<any>;
    delete(path: string, options?: RequestOptions): AbortablePromise<any>;
    head(path: string, options?: RequestOptions): AbortablePromise<any>;
    options(path: string, options?: RequestOptions): AbortablePromise<any>;
    post(path: string, options?: RequestOptions): AbortablePromise<any>;
    put(path: string, options?: RequestOptions): AbortablePromise<any>;
    patch(path: string, options?: RequestOptions): AbortablePromise<any>;
    request(path: string, options?: RequestOptions): AbortablePromise<any>;
    private _buildFetchOptions;
    private static _isPlainObject;
    private _buildURL;
    private static _determineResponseView;
    private static _parseResponseViewType;
}
