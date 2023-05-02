export interface IOptions {
  reconnectDelay?: number;

  heartbeatInterval?: number;

  defaultRoundTimeout?: number;

  retryRouteCount?: number;

  pullInterval?: number;

  defaultOffset?: number;

  getLimit?: number;

  queueCapacity?: number;

  masterEnabled?: boolean;

  sslEnabled?: boolean;

  debugRoundEnabled?: boolean;
}

export default IOptions;
