const Connection = require("./Connection");

class ConnectionManager {
  constructor(options) {
    this._options = options;
    this._connections = new Map();
    this._refcounts = new Map();
  }

  fetch(endpoint) {
    let connection = this._connections.get(endpoint);
    if (typeof connection === "undefined") {
      connection = new Connection(endpoint, this._options);
      this._connections.set(endpoint, connection);
    }
    let ref_count = this._refcounts.get(endpoint);
    if (typeof ref_count === "undefined") {
      ref_count = 0;
    }
    this._refcounts.set(endpoint, ref_count + 1);
    return connection;
  }

  release(connection) {
    let endpoint = connection.getEndpoint();
    let ref_count = this._refcounts.get(endpoint);
    if (typeof ref_count === "undefined" || ref_count - 1 <= 0) {
      connection.close();
      this._connections.delete(endpoint);
      this._refcounts.delete(endpoint);
    } else {
      this._refcounts.set(endpoint, ref_count - 1);
    }
  }

  close() {
    for (const connection of this._connections.values()) {
      connection.close();
    }
    this._connections.clear();
    this._refcounts.clear();
  }
}

module.exports = ConnectionManager;
