import Connection from "./Connection";
export class ConnectionManager {
    constructor(options) {
        this._options = options;
        this._connections = new Map();
        this._refCounts = new Map();
    }
    fetch(endpoint) {
        let connection = this._connections.get(endpoint);
        if (typeof connection === "undefined") {
            connection = new Connection(endpoint, this._options);
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
export default ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map