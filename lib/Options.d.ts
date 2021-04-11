import IOptionalOptions from "./IOptionalOptions";
export declare class Options implements IOptionalOptions {
    readonly reconnectDelay: number;
    readonly heartbeatInterval: number;
    readonly defaultRoundTimeout: number;
    readonly retryRouteCount: number;
    readonly pullInterval: number;
    readonly defaultOffset: number;
    readonly getLimit: number;
    readonly queueCapacity: number;
    readonly masterEnabled: boolean;
    readonly sslEnabled: boolean;
    readonly debugRoundEnabled: boolean;
    constructor(options?: IOptionalOptions);
}
export default Options;
