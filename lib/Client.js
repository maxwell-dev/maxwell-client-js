"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Options_1 = __importDefault(require("./Options"));
const ConnectionManager_1 = __importDefault(require("./ConnectionManager"));
const Frontend_1 = __importDefault(require("./Frontend"));
const Subscriber_1 = __importDefault(require("./Subscriber"));
const Doer_1 = __importDefault(require("./Doer"));
const Watcher_1 = __importDefault(require("./Watcher"));
const Publisher_1 = require("./Publisher");
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = new Options_1.default(options);
        this._connectionManager = new ConnectionManager_1.default(this._options);
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
            this._frontend = new Frontend_1.default(this._endpoints, this._connectionManager, this._options);
        }
    }
    _ensureDoerInited() {
        if (this._doer === null) {
            this._ensureFrontendInited();
            this._doer = new Doer_1.default(this._frontend);
        }
    }
    _ensureWatcherInited() {
        if (this._watcher === null) {
            this._ensureFrontendInited();
            this._watcher = new Watcher_1.default(this._frontend);
        }
    }
    _ensurePublisherInited() {
        if (this._publisher === null) {
            this._publisher = new Publisher_1.Publisher(this._endpoints, this._connectionManager, this._options);
        }
    }
    _ensureSubscriberInited() {
        if (this._subscriber === null) {
            this._ensureFrontendInited();
            this._subscriber = new Subscriber_1.default(this._frontend);
        }
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=Client.js.map