"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsChannel = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const maxwell_utils_1 = require("maxwell-utils");
const internal_1 = require("./internal");
class WsChannel extends maxwell_utils_1.Listenable {
    constructor(masterClient, options) {
        super();
        this._masterClient = masterClient;
        this._options = options;
        this._connection = new maxwell_utils_1.MultiAltEndpointsConnection(this._pickEndpoint.bind(this), this._options, this);
        this._failedToConnect = false;
        this._subscriberManager = new internal_1.SubscriberManager(this._connection, this._options);
    }
    close() {
        this._connection.close();
    }
    request(path, payload, headers) {
        if (this._connection.isOpen()) {
            return this._connection
                .request(this._createReqReq(path, payload, headers), this._options.roundTimeout)
                .then((result) => {
                return JSON.parse(result.payload);
            });
        }
        else {
            return this._connection
                .waitOpen(this._options.waitOpenTimeout)
                .then((connection) => {
                return connection
                    .request(this._createReqReq(path, payload, headers), this._options.roundTimeout)
                    .then((result) => {
                    return JSON.parse(result.payload);
                });
            });
        }
    }
    subscribe(topic, offset, consumer) {
        return this._subscriberManager.subscribe(topic, offset, consumer);
    }
    unsubscribe(topic, key) {
        return this._subscriberManager.unsubscribe(topic, key);
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
    _pickEndpoint() {
        return this._masterClient.pickFrontend(this._failedToConnect);
    }
    _createReqReq(path, payload, headers) {
        return new maxwell_protocol_1.msg_types.req_req_t({
            path,
            payload: JSON.stringify(payload ? payload : {}),
            header: headers ? headers : {},
        });
    }
}
exports.WsChannel = WsChannel;
exports.default = WsChannel;
//# sourceMappingURL=ws-channel.js.map