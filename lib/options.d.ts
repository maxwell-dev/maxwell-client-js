export interface IOptions {
    waitOpenTimeout?: number;
    reconnectDelay?: number;
    heartbeatInterval?: number;
    roundTimeout?: number;
    retryRouteCount?: number;
    sslEnabled?: boolean;
    roundDebugEnabled?: boolean;
    localStoreEnabled?: boolean;
    pullInterval?: number;
    pullLimit?: number;
    queueCapacity?: number;
}
export declare class Options implements IOptions {
    readonly waitOpenTimeout: number;
    readonly reconnectDelay: number;
    readonly heartbeatInterval: number;
    readonly roundTimeout: number;
    readonly retryRouteCount: number;
    readonly sslEnabled: boolean;
    readonly roundDebugEnabled: boolean;
    readonly localStoreEnabled?: boolean;
    readonly pullInterval: number;
    readonly pullLimit: number;
    readonly queueCapacity: number;
    constructor(options?: IOptions);
}
export default Options;
