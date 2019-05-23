const protocol = require("maxwell-protocol");
const Code = require("./Code");
const Event = require("./Event");
const Condition = require("./Condition");

class Master {

  constructor(endpoints, connectionManager, options) {
    this._endpoints = endpoints;
    this._connectionManager = connectionManager;
    this._options = options;

    this._connection = null;
    this._endpoint_index = -1;
    this._connectToMaster();

    this._condition = new Condition(() => {
      return this._condition && this._connection.isOpen()
    });
  }

  close() {
    this._disconnectFromMaster();
    this._condition.clear();
  }

  async resolveFrontend() {
    let resolveFrontendRep = await this._wait_and_request(
        this._buildResolveFrontendReq()
    );
    let endpoint = resolveFrontendRep.endpoint;
    if (typeof endpoint === 'undefined') {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }
    return endpoint;
  }

  _connectToMaster() {
    this._connection = this._connectionManager.fetch(this._nextEndpoint());
    this._connection.addListener(
        Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
    this._connection.addListener(
        Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
  }

  _disconnectFromMaster() {
    this._connection.deleteListener(
        Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
    this._connection.deleteListener(
        Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
    this._connectionManager.release(this._connection);
    this._connection = null;
  }

  _onConnectToMasterDone() {
    this._condition.notify();
  }

  _onConnectToMasterFailed(code) {
    if (code === Code.FAILED_TO_CONNECT) {
      this._disconnectFromMaster();
      setTimeout(() => this._connectToMaster(), 1000);
    }
  }

  _nextEndpoint() {
    this._endpoint_index += 1;
    if (this._endpoint_index >= this._endpoints.length) {
      this._endpoint_index = 0;
    }
    return this._endpoints[this._endpoint_index];
  }

  async _wait_and_request(msg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    return await this._connection.send(msg).wait();
  }

  _buildResolveFrontendReq() {
    return protocol.resolve_frontend_req_t.create();
  }

}

module.exports = Master;
