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
import Master from "./Master";
export class Publisher {
    constructor(endpoints, connectionManager, options) {
        this._endpoints = endpoints;
        this._connectionManager = connectionManager;
        this._options = options;
        this._connections = new Map();
    }
    close() {
        for (const endpoint of this._connections.keys()) {
            this._disconnectFromBackend(endpoint);
        }
    }
    publish(topic, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = yield this._resolveEndpoint(topic);
            const connection = this._connectToBackend(endpoint);
            yield this._publish(connection, topic, value);
        });
    }
    _resolveEndpoint(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            const master = new Master(this._endpoints, this._connectionManager, this._options);
            try {
                return yield master.resolveBackend(topic);
            }
            finally {
                master.close();
            }
        });
    }
    _connectToBackend(endpoint) {
        let connection = this._connections.get(endpoint);
        if (typeof connection === "undefined") {
            connection = this._connectionManager.fetch(endpoint);
            this._connections.set(endpoint, connection);
        }
        return connection;
    }
    _disconnectFromBackend(endpoint) {
        const connection = this._connections.get(endpoint);
        if (typeof connection !== "undefined") {
            this._connectionManager.release(connection);
        }
    }
    _publish(connection, topic, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection.waitUntilOpen();
            yield connection.request(this._buildPublishReq(topic, value));
        });
    }
    _buildPublishReq(topic, value) {
        return new msg_types.push_req_t({ topic, value });
    }
}
//# sourceMappingURL=Publisher.js.map