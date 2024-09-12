"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("../internal");
const _1 = require("./");
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = (0, internal_1.buildOptions)(options);
        this._requester = new _1.Requester(this._endpoints, this._options);
        this._subscriberManager = new _1.SubscriberManager(this._endpoints, this._options);
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
        this._requester.close();
        this._subscriberManager.close();
    }
    ws(path, options) {
        return this._requester.request(path, options);
    }
    request(path, options) {
        return this._requester.request(path, options);
    }
    subscribe(topic, offset, consumer) {
        return this._subscriberManager.subscribe(topic, offset, consumer);
    }
    unsubscribe(topic, key) {
        return this._subscriberManager.unsubscribe(topic, key);
    }
    addConnectionListener(event, listener) {
        this._subscriberManager.addListener(event, listener);
    }
    deleteConnectionListener(event, listener) {
        this._subscriberManager.deleteListener(event, listener);
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=client.js.map