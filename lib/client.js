"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("./internal");
class Client {
    constructor(endpoints, options) {
        this._options = (0, internal_1.buildOptions)(options);
        this._httpRequester = new internal_1.http.Requester(endpoints, this._options);
        this._wsRequester = new internal_1.ws.Requester(endpoints, this._options);
        this._subscriberManager = new internal_1.ws.SubscriberManager(endpoints, this._options);
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
        this._httpRequester.close();
        this._wsRequester.close();
        this._subscriberManager.close();
    }
    get(path, options) {
        return this._httpRequester.get(path, options);
    }
    delete(path, options) {
        return this._httpRequester.delete(path, options);
    }
    head(path, options) {
        return this._httpRequester.head(path, options);
    }
    options(path, options) {
        return this._httpRequester.options(path, options);
    }
    post(path, options) {
        return this._httpRequester.post(path, options);
    }
    put(path, options) {
        return this._httpRequester.put(path, options);
    }
    patch(path, options) {
        return this._httpRequester.patch(path, options);
    }
    requestViaHttp(path, options) {
        return this._httpRequester.request(path, options);
    }
    ws(path, options) {
        return this._wsRequester.request(path, options);
    }
    requestViaWs(path, options) {
        return this._wsRequester.request(path, options);
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