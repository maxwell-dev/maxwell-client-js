"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const internal_1 = require("./internal");
class Master {
    constructor(endpoints, connectionManager, options) {
        this._endpoints = endpoints;
        this._connectionManager = connectionManager;
        this._options = options;
        this._connection = null;
        this._endpoint_index = -1;
        this._connectToMaster();
        this._condition = new internal_1.Condition(() => {
            return this._connection !== null && this._connection.isOpen();
        });
    }
    close() {
        this._disconnectFromMaster();
        this._condition.clear();
    }
    async assignFrontend() {
        const assignFrontendRep = await this._waitAndRequest(this._buildAssignFrontendReq());
        const endpoint = assignFrontendRep.endpoint;
        if (typeof endpoint === "undefined") {
            throw new Error(`Invalid endpoint: ${endpoint}`);
        }
        return endpoint;
    }
    _connectToMaster() {
        this._connection = this._connectionManager.fetch(this._nextEndpoint());
        this._connection.addListener(internal_1.Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
        this._connection.addListener(internal_1.Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
    }
    _disconnectFromMaster() {
        if (!this._connection) {
            return;
        }
        this._connection.deleteListener(internal_1.Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
        this._connection.deleteListener(internal_1.Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
        this._connectionManager.release(this._connection);
        this._connection = null;
    }
    _onConnectToMasterDone() {
        this._condition.notify();
    }
    _onConnectToMasterFailed(code) {
        if (code === internal_1.Code.FAILED_TO_CONNECT) {
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
    async _waitAndRequest(msg) {
        await this._condition.wait(this._options.defaultRoundTimeout, msg);
        if (this._connection === null) {
            throw new Error("Connection was lost");
        }
        return await this._connection.request(msg).wait();
    }
    _buildAssignFrontendReq() {
        return new maxwell_protocol_1.msg_types.assign_frontend_req_t();
    }
}
exports.Master = Master;
exports.default = Master;
//# sourceMappingURL=master.js.map