import { Options } from "./internal";
export declare class Master {
    private _endpoints;
    private _options;
    private _endpoint_index;
    constructor(endpoints: string[], options: Options);
    assignFrontend(force?: boolean): Promise<string>;
    getFrontends(force?: boolean): Promise<string>;
    private _request;
    private _nextEndpoint;
    private _buildUrl;
    private static _now;
}
export default Master;
