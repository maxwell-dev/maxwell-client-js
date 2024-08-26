export interface Options {
    waitOpenTimeout?: number;
    reconnectDelay?: number;
    heartbeatInterval?: number;
    roundTimeout?: number;
    retryRouteCount?: number;
    sslEnabled?: boolean;
    roundLogEnabled?: boolean;
    localStoreEnabled?: boolean;
    pullInterval?: number;
    pullLimit?: number;
    queueCapacity?: number;
    consumeBatchSize?: number;
    consumeBatchInterval?: number;
}
export declare function defaultOptions(options?: Options): Required<Options>;
export default Options;
