"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("./internal");
const globalWithMaxwellClient = globalThis;
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = new internal_1.Options(options);
        this._master = new internal_1.Master(this._endpoints, this._options);
        this._frontend = new internal_1.Frontend(this._master, this._options);
    }
    static singleton(endpoints, options) {
        if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
            globalWithMaxwellClient.maxwellClient = new Client(endpoints, options);
        }
        return globalWithMaxwellClient.maxwellClient;
    }
    static createInstance(endpoints, options) {
        if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
            globalWithMaxwellClient.maxwellClient = new Client(endpoints, options);
        }
        return globalWithMaxwellClient.maxwellClient;
    }
    static getInstance() {
        if (typeof globalWithMaxwellClient.maxwellClient === "undefined") {
            throw new Error("The instance has not initialized yet!");
        }
        return globalWithMaxwellClient.maxwellClient;
    }
    close() {
        this._frontend.close();
    }
    addConnectionListener(event, listener) {
        this._frontend.addListener(event, listener);
    }
    deleteConnectionListener(event, listener) {
        this._frontend.deleteListener(event, listener);
    }
    request(path, payload, headers) {
        return this._frontend.request(path, payload, headers);
    }
    subscribe(topic, offset, onMsg) {
        this._frontend.subscribe(topic, offset, onMsg);
    }
    unsubscribe(topic) {
        this._frontend.unsubscribe(topic);
    }
    get(topic, offset, limit) {
        return this._frontend.get(topic, offset, limit);
    }
    commit(topic, offset) {
        this._frontend.commit(topic, offset);
    }
    receive(topic, offset, limit) {
        return this._frontend.receive(topic, offset, limit);
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=client.js.map