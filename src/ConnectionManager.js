const Connection = require("./Connection");

class ConnectionManager {

  constructor(options) {
    this._options = options;
    this._connections = [];
    this._ref_counts = [];
  }

  fetch(endpoint) {
    let connection = this._connections[endpoint];
    if (typeof connection === "undefined") {
      connection = new Connection(endpoint, this._options);
      this._connections[endpoint] = connection;
    }
    let ref_count = this._ref_counts[endpoint];
    if (typeof ref_count === "undefined") {
      ref_count = 0
    }
    this._ref_counts[endpoint] = ref_count + 1;
    return connection;
  }

  release(connection) {
    let endpoint = connection.getEndpoint();
    let ref_count = this._ref_counts[endpoint];
    connection.clear();
    if (typeof ref_count === "undefined" || ref_count - 1 <= 0) {
      connection.close();
      delete this._connections[endpoint];
      delete this._ref_counts[endpoint];
    } else {
      this._ref_counts[endpoint] = ref_count - 1;
    }
  }

  close() {
    for (let connection in this._connections) {
      connection.close();
    }
    this._connections = [];
    this._ref_counts = [];
  }

}

module.exports = ConnectionManager;
