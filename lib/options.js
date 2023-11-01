"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
class Options {
    constructor(options) {
        if (typeof options === "undefined") {
            options = {};
        }
        if (typeof options.waitOpenTimeout === "undefined") {
            this.waitOpenTimeout = 3000;
        }
        else {
            this.waitOpenTimeout = options.waitOpenTimeout;
        }
        if (typeof options.reconnectDelay === "undefined") {
            this.reconnectDelay = 2000;
        }
        else {
            this.reconnectDelay = options.reconnectDelay;
        }
        if (typeof options.heartbeatInterval === "undefined") {
            this.heartbeatInterval = 10000;
        }
        else {
            this.heartbeatInterval = options.heartbeatInterval;
        }
        if (typeof options.defaultRoundTimeout === "undefined") {
            this.defaultRoundTimeout = 5000;
        }
        else {
            this.defaultRoundTimeout = options.defaultRoundTimeout;
        }
        if (typeof options.retryRouteCount === "undefined") {
            this.retryRouteCount = 0;
        }
        else {
            this.retryRouteCount = options.retryRouteCount;
        }
        if (typeof options.pullInterval === "undefined") {
            this.pullInterval = 10;
        }
        else {
            this.pullInterval = options.pullInterval;
        }
        if (typeof options.defaultOffset === "undefined") {
            this.defaultOffset = -300;
        }
        else {
            this.defaultOffset = options.defaultOffset;
        }
        if (typeof options.getLimit === "undefined") {
            this.getLimit = 128;
        }
        else {
            this.getLimit = options.getLimit;
        }
        if (typeof options.queueCapacity === "undefined") {
            this.queueCapacity = 512;
        }
        else {
            this.queueCapacity = options.queueCapacity;
        }
        if (typeof options.sslEnabled === "undefined") {
            this.sslEnabled = false;
        }
        else {
            this.sslEnabled = options.sslEnabled;
        }
        if (typeof options.debugRoundEnabled === "undefined") {
            this.debugRoundEnabled = false;
        }
        else {
            this.debugRoundEnabled = options.debugRoundEnabled;
        }
    }
}
exports.Options = Options;
exports.default = Options;
//# sourceMappingURL=options.js.map