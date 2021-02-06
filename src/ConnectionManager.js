const Connection = require("./Connection");

class ConnectionManager {
  constructor(options) {
    this._options = options;
    this._connections = new Map();
    this._refCount = new Map();
  }

  fetch(endpoint) {
    let connection = this._connections.get(endpoint);
    if (typeof connection === "undefined") {
      connection = new Connection(endpoint, this._options);
      this._connections.set(endpoint, connection);
    }
    let refCount = this._refCount.get(endpoint);
    if (typeof refCount === "undefined") {
      refCount = 0;
    }
    this._refCount.set(endpoint, refCount + 1);
    return connection;
  }

  release(connection) {
    let endpoint = connection.getEndpoint();
    let refCount = this._refCount.get(endpoint);
    if (typeof refCount === "undefined" || refCount - 1 <= 0) {
      connection.close();
      this._connections.delete(endpoint);
      this._refCount.delete(endpoint);
    } else {
      this._refCount.set(endpoint, refCount - 1);
    }
  }

  close() {
    for (const connection of this._connections.values()) {
      connection.close();
    }
    this._connections.clear();
    this._refCount.clear();
  }
}

module.exports = ConnectionManager;
