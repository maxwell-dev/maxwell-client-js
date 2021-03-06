"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const Master_1 = __importDefault(require("./Master"));
class Publisher {
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
            const master = new Master_1.default(this._endpoints, this._connectionManager, this._options);
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
        return new maxwell_protocol_1.msg_types.push_req_t({ topic, value });
    }
}
exports.Publisher = Publisher;
//# sourceMappingURL=Publisher.js.map