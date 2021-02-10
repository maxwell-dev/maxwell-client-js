const ConnectionManager = require("./ConnectionManager");
const Frontend = require("./Frontend");
const Subscriber = require("./Subscriber");
const Doer = require("./Doer");
const Wather = require("./Watcher");

class Client {
  constructor(endpoints, options) {
    this._endpoints = endpoints;
    this._initOptions(options);

    this._connectionManager = new ConnectionManager(this._options);
    this._frontend = null;
    this._subscriber = null;
    this._doer = null;
    this._watcher = null;
  }

  close() {
    this._frontend && this._frontend.close();
    this._connectionManager.close();
  }

  getFrontend() {
    this._ensureFrontendInited();
    return this._frontend;
  }

  getSubscriber() {
    this._ensureSubscriberInited();
    return this._subscriber;
  }

  getDoer() {
    this._ensureDoerInited();
    return this._doer;
  }

  getWatcher() {
    this._ensureWatcherInited();
    return this._watcher;
  }

  _initOptions(options) {
    this._options = options || {};
    if (typeof this._options.reconnectDelay === "undefined") {
      this._options.reconnectDelay = 3000;
    }
    if (typeof this._options.heartbeatInterval === "undefined") {
      this._options.heartbeatInterval = 10000;
    }
    if (typeof this._options.defaultRoundTimeout === "undefined") {
      this._options.defaultRoundTimeout = 15000;
    }
    if (typeof this._options.retryRouteCount === "undefined") {
      this._options.retryRouteCount = 0;
    }
    if (typeof this._options.pullInterval === "undefined") {
      this._options.pullInterval = 10;
    }
    if (typeof this._options.defaultOffset === "undefined") {
      this._options.defaultOffset = -600;
    }
    if (typeof this._options.getLimit === "undefined") {
      this._options.getLimit = 64;
    }
    if (typeof this._options.queueCapacity === "undefined") {
      this._options.queueCapacity = 512;
    }
    if (typeof this._options.masterEnabled === "undefined") {
      this._options.masterEnabled = true;
    }
    if (typeof this._options.sslEnabled === "undefined") {
      this._options.sslEnabled = false;
    }
    if (typeof this._options.debugRoundEnabled === "undefined") {
      this._options.debugRoundEnabled = false;
    }
  }

  _ensureFrontendInited() {
    if (this._frontend) {
      return;
    }
    this._frontend = new Frontend(
      this._endpoints,
      this._connectionManager,
      this._options
    );
  }

  _ensureSubscriberInited() {
    if (this._subscriber) {
      return;
    }
    this._ensureFrontendInited();
    this._subscriber = new Subscriber(this._frontend);
  }

  _ensureDoerInited() {
    if (this._doer) {
      return;
    }
    this._ensureFrontendInited();
    this._doer = new Doer(this._frontend);
  }

  _ensureWatcherInited() {
    if (this._watcher) {
      return;
    }
    this._ensureFrontendInited();
    this._watcher = new Wather(this._frontend);
  }
}

module.exports = Client;
