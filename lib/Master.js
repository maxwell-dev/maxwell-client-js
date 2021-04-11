var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { msg_types } from "maxwell-protocol";
import Code from "./Code";
import Event from "./Event";
import Condition from "./Condition";
export class Master {
    constructor(endpoints, connectionManager, options) {
        this._endpoints = endpoints;
        this._connectionManager = connectionManager;
        this._options = options;
        this._connection = null;
        this._endpoint_index = -1;
        this._connectToMaster();
        this._condition = new Condition(() => {
            return this._connection !== null && this._connection.isOpen();
        });
    }
    close() {
        this._disconnectFromMaster();
        this._condition.clear();
    }
    resolveFrontend() {
        return __awaiter(this, void 0, void 0, function* () {
            const resolveFrontendRep = yield this._waitAndRequest(this._buildResolveFrontendReq());
            const endpoint = resolveFrontendRep.endpoint;
            if (typeof endpoint === "undefined") {
                throw new Error(`Invalid endpoint: ${endpoint}`);
            }
            return endpoint;
        });
    }
    resolveBackend(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolve_backend_rep = yield this._waitAndRequest(this._buildResolveBackendReq(topic));
            const endpoint = resolve_backend_rep.endpoint;
            if (typeof endpoint === "undefined") {
                throw new Error(`Invalid endpoint: ${endpoint}`);
            }
            return endpoint;
        });
    }
    _connectToMaster() {
        this._connection = this._connectionManager.fetch(this._nextEndpoint());
        this._connection.addListener(Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
        this._connection.addListener(Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
    }
    _disconnectFromMaster() {
        if (!this._connection) {
            return;
        }
        this._connection.deleteListener(Event.ON_CONNECTED, this._onConnectToMasterDone.bind(this));
        this._connection.deleteListener(Event.ON_ERROR, this._onConnectToMasterFailed.bind(this));
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
    _waitAndRequest(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._condition.wait(this._options.defaultRoundTimeout, msg);
            if (this._connection === null) {
                throw new Error("Connection was lost");
            }
            return yield this._connection.request(msg).wait();
        });
    }
    _buildResolveFrontendReq() {
        return new msg_types.resolve_frontend_req_t();
    }
    _buildResolveBackendReq(topic) {
        return new msg_types.resolve_backend_req_t({ topic });
    }
}
export default Master;
//# sourceMappingURL=Master.js.map