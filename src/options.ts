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

export function defaultOptions(options?: Options): Required<Options> {
  if (typeof options === "undefined") {
    options = {};
  }
  if (typeof options.waitOpenTimeout === "undefined") {
    options.waitOpenTimeout = 3000;
  }
  if (typeof options.reconnectDelay === "undefined") {
    options.reconnectDelay = 2000;
  }
  if (typeof options.heartbeatInterval === "undefined") {
    options.heartbeatInterval = 10000;
  }
  if (typeof options.roundTimeout === "undefined") {
    options.roundTimeout = 5000;
  }
  if (typeof options.retryRouteCount === "undefined") {
    options.retryRouteCount = 0;
  }
  if (typeof options.sslEnabled === "undefined") {
    options.sslEnabled = false;
  }
  if (typeof options.roundLogEnabled === "undefined") {
    options.roundLogEnabled = false;
  }
  if (typeof options.localStoreEnabled === "undefined") {
    options.localStoreEnabled = true;
  }
  if (typeof options.pullInterval === "undefined") {
    options.pullInterval = 0;
  }
  if (typeof options.pullLimit === "undefined") {
    options.pullLimit = 128;
  }
  if (typeof options.queueCapacity === "undefined") {
    options.queueCapacity = 512;
  }
  if (typeof options.consumeBatchSize === "undefined") {
    options.consumeBatchSize = 64;
  }
  if (typeof options.consumeBatchInterval === "undefined") {
    options.consumeBatchInterval = 0;
  }
  return options as Required<Options>;
}

export default Options;
