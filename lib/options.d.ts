export interface IOptions {
    waitOpenTimeout?: number;
    reconnectDelay?: number;
    heartbeatInterval?: number;
    defaultRoundTimeout?: number;
    retryRouteCount?: number;
    pullInterval?: number;
    defaultOffset?: number;
    getLimit?: number;
    queueCapacity?: number;
    sslEnabled?: boolean;
    debugRoundEnabled?: boolean;
}
export declare class Options implements IOptions {
    readonly waitOpenTimeout: number;
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
