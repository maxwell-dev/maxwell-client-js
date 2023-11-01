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
export default IOptions;
