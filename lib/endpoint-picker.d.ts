import AbortablePromise from "@xuchaoqian/abortable-promise";
import { Options } from "./internal";
export interface EndpointPicker {
    pick(...args: any[]): AbortablePromise<string>;
}
export declare class RandomEndpointPicker implements EndpointPicker {
    private _endpoints;
    constructor(endpoints: string[]);
    pick(): AbortablePromise<string>;
}
export declare class RoundRobinEndpointPicker implements EndpointPicker {
    private _endpoints;
    private _index;
    constructor(endpoints: string[]);
    pick(): AbortablePromise<string>;
}
export declare class DelegatedEndpointPicker implements EndpointPicker {
    private _masterClient;
    constructor(endpoints: string[], options: Options);
    pick(forceMaster?: boolean): AbortablePromise<string>;
}
export declare function createEndpointPicker(endpoints: string[], options: Options): EndpointPicker;
