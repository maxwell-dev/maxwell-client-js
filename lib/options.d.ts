import { IOptions } from "./internal";
export declare class Options implements IOptions {
    readonly waitOpenTimeout?: number | undefined;
    readonly reconnectDelay: number;
    readonly heartbeatInterval: number;
    readonly defaultRoundTimeout: number;
    readonly retryRouteCount: number;
    readonly pullInterval: number;
    readonly defaultOffset: number;
    readonly getLimit: number;
    readonly queueCapacity: number;
    readonly sslEnabled: boolean;
    readonly debugRoundEnabled: boolean;
    constructor(options?: IOptions);
}
export default Options;
