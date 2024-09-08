"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const maxwell_utils_1 = require("maxwell-utils");
const internal_1 = require("../internal");
class Channel extends maxwell_utils_1.Listenable {
    constructor(endpoints, options) {
        super();
        this.options = options;
        this.endpointPicker = (0, internal_1.createEndpointPicker)(endpoints, options);
        this._failedToConnect = false;
    }
    onConnecting(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_CONNECTING, connection, ...rest);
    }
    onConnected(connection, ...rest) {
        this._failedToConnect = false;
        this.notify(maxwell_utils_1.Event.ON_CONNECTED, connection, ...rest);
    }
    onDisconnecting(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_DISCONNECTING, connection, ...rest);
    }
    onDisconnected(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_DISCONNECTED, connection, ...rest);
    }
    onCorrupted(connection, ...rest) {
        this._failedToConnect = true;
        this.notify(maxwell_utils_1.Event.ON_CORRUPTED, connection, ...rest);
    }
    onBecameUnhealthy(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_BECAME_UNHEALTHY, connection, ...rest);
    }
    onBecameHealthy(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_BECAME_HEALTHY, connection, ...rest);
    }
    onBecameIdle(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_BECAME_IDLE, connection, ...rest);
    }
    onBecameActive(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_BECAME_ACTIVE, connection, ...rest);
    }
    pickEndpoint() {
        return this.endpointPicker.pick(this._failedToConnect);
    }
}
exports.Channel = Channel;
exports.default = Channel;
//# sourceMappingURL=channel.js.map