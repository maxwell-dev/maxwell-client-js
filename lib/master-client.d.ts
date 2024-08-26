import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";
import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "./internal";
export declare class MasterClient {
    private _endpoints;
    private _options;
    private _endpoint_index;
    private _localstore?;
    constructor(endpoints: string[], options: Options);
    pickFrontend(force?: boolean): AbortablePromise<string>;
    pickFrontends(force?: boolean): Promise<string>;
    private _request;
    private _getEndpointsFromCache;
    private _setEndpointsToCache;
    private _nextEndpoint;
    private _buildUrl;
    private static _fetchWithTimeout;
    private static _now;
}
export default MasterClient;
