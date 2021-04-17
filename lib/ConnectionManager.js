"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const Connection_1 = __importDefault(require("./Connection"));
class ConnectionManager {
    constructor(options) {
        this._options = options;
        this._connections = new Map();
        this._refCounts = new Map();
    }
    fetch(endpoint) {
        let connection = this._connections.get(endpoint);
        if (typeof connection === "undefined") {
            connection = new Connection_1.default(endpoint, this._options);
            this._connections.set(endpoint, connection);
        }
        let refCount = this._refCounts.get(endpoint);
        if (typeof refCount === "undefined") {
            refCount = 0;
        }
        this._refCounts.set(endpoint, refCount + 1);
        return connection;
    }
    release(connection) {
        const endpoint = connection.getEndpoint();
        const refCount = this._refCounts.get(endpoint);
        if (typeof refCount === "undefined" || refCount - 1 <= 0) {
            connection.close();
            this._connections.delete(endpoint);
            this._refCounts.delete(endpoint);
        }
        else {
            this._refCounts.set(endpoint, refCount - 1);
        }
    }
    close() {
        for (const connection of this._connections.values()) {
            connection.close();
        }
        this._connections.clear();
        this._refCounts.clear();
    }
}
exports.ConnectionManager = ConnectionManager;
exports.default = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map