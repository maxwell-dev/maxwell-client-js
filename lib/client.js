"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("./internal");
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = (0, internal_1.defaultOptions)(options);
        this._masterClient = new internal_1.MasterClient(this._endpoints, this._options);
        this._wsChannel = new internal_1.WsChannel(this._masterClient, this._options);
    }
    static create(endpoints, options) {
        if (typeof Client._instance === "undefined") {
            Client._instance = new Client(endpoints, options);
        }
        return Client._instance;
    }
    static get instance() {
        if (typeof Client._instance === "undefined") {
            throw new Error("The instance has not initialized yet!");
        }
        return Client._instance;
    }
    close() {
        this._wsChannel.close();
    }
    ws(path, payload, headers) {
        return this._wsChannel.request(path, payload, headers);
    }
    requestViaWs(path, payload, headers) {
        return this._wsChannel.request(path, payload, headers);
    }
    subscribe(topic, offset, consumer) {
        return this._wsChannel.subscribe(topic, offset, consumer);
    }
    unsubscribe(topic, key) {
        return this._wsChannel.unsubscribe(topic, key);
    }
    addConnectionListener(event, listener) {
        this._wsChannel.addListener(event, listener);
    }
    deleteConnectionListener(event, listener) {
        this._wsChannel.deleteListener(event, listener);
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=client.js.map