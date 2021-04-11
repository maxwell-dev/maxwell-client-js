import { msg_types } from "maxwell-protocol";
import Connection from "./Connection";
import ConnectionManager from "./ConnectionManager";
import Master from "./Master";
import Options from "./Options";

export class Publisher {
  private _endpoints: string[];
  private _connectionManager: ConnectionManager;
  private _options: Options;
  private _connections: Map<string, Connection>;

  constructor(
    endpoints: string[],
    connectionManager: ConnectionManager,
    options: Options
  ) {
    this._endpoints = endpoints;
    this._connectionManager = connectionManager;
    this._options = options;
    this._connections = new Map();
  }

  close(): void {
    for (const endpoint of this._connections.keys()) {
      this._disconnectFromBackend(endpoint);
    }
  }

  async publish(topic: string, value: Uint8Array): Promise<void> {
    const endpoint = await this._resolveEndpoint(topic);
    const connection = this._connectToBackend(endpoint);
    await this._publish(connection, topic, value);
  }

  private async _resolveEndpoint(topic: string) {
    const master = new Master(
      this._endpoints,
      this._connectionManager,
      this._options
    );
    try {
      return await master.resolveBackend(topic);
    } finally {
      master.close();
    }
  }

  private _connectToBackend(endpoint: string) {
    let connection = this._connections.get(endpoint);
    if (typeof connection === "undefined") {
      connection = this._connectionManager.fetch(endpoint);
      this._connections.set(endpoint, connection);
    }
    return connection;
  }

  private _disconnectFromBackend(endpoint: string) {
    const connection = this._connections.get(endpoint);
    if (typeof connection !== "undefined") {
      this._connectionManager.release(connection);
    }
  }

  private async _publish(
    connection: Connection,
    topic: string,
    value: Uint8Array
  ) {
    await connection.waitUntilOpen();
    await connection.request(this._buildPublishReq(topic, value));
  }

  private _buildPublishReq(topic: string, value: Uint8Array) {
    return new msg_types.push_req_t({ topic, value });
  }
}
