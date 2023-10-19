import { Options } from "./internal";
export declare class Master {
    private _endpoints;
    private _options;
    private _endpoint_index;
    private _localstore;
    constructor(endpoints: string[], options: Options);
    pickFrontend(force?: boolean): Promise<string>;
    pickFrontends(force?: boolean): Promise<string>;
    private _request;
    private _nextEndpoint;
    private _buildUrl;
    private static _now;
}
export default Master;