import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Options } from "./internal";
export declare class MasterClient {
    private _endpoints;
    private _options;
    private _endpointIndex;
    private _localstore?;
    private static _instances;
    private constructor();
    static getOrCreateInstance(endpoints: string[], options: Options): MasterClient;
    pickFrontend(force?: boolean): AbortablePromise<string>;
    pickFrontends(force?: boolean): Promise<string>;
    private _request;
    private _getEndpointsFromCache;
    private _setEndpointsToCache;
    private _nextEndpoint;
    private _buildUrl;
    private static _fetchWithTimeout;
}
export default MasterClient;
