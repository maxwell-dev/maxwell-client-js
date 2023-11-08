export interface IOptions {
    waitOpenTimeout?: number;
    reconnectDelay?: number;
    heartbeatInterval?: number;
    roundTimeout?: number;
    retryRouteCount?: number;
    pullInterval?: number;
    defaultOffset?: number;
    pullLimit?: number;
    queueCapacity?: number;
    sslEnabled?: boolean;
    roundDebugEnabled?: boolean;
}
export declare class Options implements IOptions {
    readonly waitOpenTimeout: number;
    readonly reconnectDelay: number;
    readonly heartbeatInterval: number;
    readonly roundTimeout: number;
    readonly retryRouteCount: number;
    readonly sslEnabled: boolean;
    readonly roundDebugEnabled: boolean;
    readonly pullInterval: number;
    readonly pullLimit: number;
    readonly queueCapacity: number;
    constructor(options?: IOptions);
}
export default Options;
