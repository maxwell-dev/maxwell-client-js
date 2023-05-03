"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("./internal");
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = new internal_1.Options(options);
        this._connectionManager = new internal_1.ConnectionManager(this._options);
        this._frontend = null;
        this._requester = null;
        this._subscriber = null;
    }
    close() {
        this._frontend?.close();
        this._connectionManager.close();
    }
    getRequester() {
        this._ensureRequesterInited();
        return this._requester;
    }
    getSubscriber() {
        this._ensureSubscriberInited();
        return this._subscriber;
    }
    _ensureRequesterInited() {
        if (this._requester === null) {
            this._ensureFrontendInited();
            this._requester = new internal_1.Requester(this._frontend);
        }
    }
    _ensureSubscriberInited() {
        if (this._subscriber === null) {
            this._ensureFrontendInited();
            this._subscriber = new internal_1.Subscriber(this._frontend);
        }
    }
    _ensureFrontendInited() {
        if (this._frontend === null) {
            this._frontend = new internal_1.Frontend(this._endpoints, this._connectionManager, this._options);
        }
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=client.js.map