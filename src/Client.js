const ConnectionManager = require("./ConnectionManager");
const Frontend = require("./Frontend");
const Subscriber = require("./Subscriber");
const Doer = require("./Doer");

class Client {

  constructor(endpoints, options) {
    this._endpoints = endpoints;
    this._initOptions(options);

    this._connectionManager = new ConnectionManager(this._options);
    this._frontend = null;
    this._subscriber = null;
    this._doer = null;
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

  _initOptions(options) {
    this._options = options || {};
    if (!this._options.reconnectDelay) {
      this._options.reconnectDelay = 3000;
    }
    if (!this._options.heartbeatInterval) {
      this._options.heartbeatInterval = 10000;
    }
    if (!this._options.defaultRoundTimeout) {
      this._options.defaultRoundTimeout = 15000;
    }
    if (!this._options.defaultOffset) {
      this._options.defaultOffset = -600;
    }
    if (!this._options.getLimit) {
      this._options.getLimit = 64;
    }
    if (!this._options.queueCapacity) {
      this._options.queueCapacity = 512;
    }
  }

  _ensureFrontendInited() {
    if (this._frontend) {
      return;
    }
    this._frontend = new Frontend(
        this._endpoints, this._connectionManager, this._options
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

}

module.exports = Client;
