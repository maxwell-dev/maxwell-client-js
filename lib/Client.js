import Options from "./Options";
import ConnectionManager from "./ConnectionManager";
import Frontend from "./Frontend";
import Subscriber from "./Subscriber";
import Doer from "./Doer";
import Wather from "./Watcher";
import { Publisher } from "./Publisher";
export class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = new Options(options);
        this._connectionManager = new ConnectionManager(this._options);
        this._frontend = null;
        this._doer = null;
        this._watcher = null;
        this._publisher = null;
        this._subscriber = null;
    }
    close() {
        var _a, _b;
        (_a = this._frontend) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this._publisher) === null || _b === void 0 ? void 0 : _b.close();
        this._connectionManager.close();
    }
    getDoer() {
        this._ensureDoerInited();
        return this._doer;
    }
    getWatcher() {
        this._ensureWatcherInited();
        return this._watcher;
    }
    getPublisher() {
        this._ensurePublisherInited();
        return this._publisher;
    }
    getSubscriber() {
        this._ensureSubscriberInited();
        return this._subscriber;
    }
    _ensureFrontendInited() {
        if (this._frontend === null) {
            this._frontend = new Frontend(this._endpoints, this._connectionManager, this._options);
        }
    }
    _ensureDoerInited() {
        if (this._doer === null) {
            this._ensureFrontendInited();
            this._doer = new Doer(this._frontend);
        }
    }
    _ensureWatcherInited() {
        if (this._watcher === null) {
            this._ensureFrontendInited();
            this._watcher = new Wather(this._frontend);
        }
    }
    _ensurePublisherInited() {
        if (this._publisher === null) {
            this._publisher = new Publisher(this._endpoints, this._connectionManager, this._options);
        }
    }
    _ensureSubscriberInited() {
        if (this._subscriber === null) {
            this._ensureFrontendInited();
            this._subscriber = new Subscriber(this._frontend);
        }
    }
}
export default Client;
//# sourceMappingURL=Client.js.map