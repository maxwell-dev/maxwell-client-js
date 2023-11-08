export interface IOptions {
  waitOpenTimeout?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  roundTimeout?: number;
  retryRouteCount?: number;
  sslEnabled?: boolean;
  roundDebugEnabled?: boolean;
  pullInterval?: number;
  pullLimit?: number;
  queueCapacity?: number;
}

export class Options implements IOptions {
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

  constructor(options?: IOptions) {
    if (typeof options === "undefined") {
      options = {};
    }
    if (typeof options.waitOpenTimeout === "undefined") {
      this.waitOpenTimeout = 3000;
    } else {
      this.waitOpenTimeout = options.waitOpenTimeout;
    }
    if (typeof options.reconnectDelay === "undefined") {
      this.reconnectDelay = 2000;
    } else {
      this.reconnectDelay = options.reconnectDelay;
    }
    if (typeof options.heartbeatInterval === "undefined") {
      this.heartbeatInterval = 10000;
    } else {
      this.heartbeatInterval = options.heartbeatInterval;
    }
    if (typeof options.roundTimeout === "undefined") {
      this.roundTimeout = 5000;
    } else {
      this.roundTimeout = options.roundTimeout;
    }
    if (typeof options.retryRouteCount === "undefined") {
      this.retryRouteCount = 0;
    } else {
      this.retryRouteCount = options.retryRouteCount;
    }
    if (typeof options.sslEnabled === "undefined") {
      this.sslEnabled = false;
    } else {
      this.sslEnabled = options.sslEnabled;
    }
    if (typeof options.roundDebugEnabled === "undefined") {
      this.roundDebugEnabled = false;
    } else {
      this.roundDebugEnabled = options.roundDebugEnabled;
    }
    if (typeof options.pullInterval === "undefined") {
      this.pullInterval = 10;
    } else {
      this.pullInterval = options.pullInterval;
    }
    if (typeof options.pullLimit === "undefined") {
      this.pullLimit = 128;
    } else {
      this.pullLimit = options.pullLimit;
    }
    if (typeof options.queueCapacity === "undefined") {
      this.queueCapacity = 512;
    } else {
      this.queueCapacity = options.queueCapacity;
    }
  }
}

export default Options;
