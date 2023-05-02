import { msg_types } from "maxwell-protocol";
import {
  Code,
  Event,
  Condition,
  ConnectionManager,
  Connection,
  Options,
  ProtocolMsg,
} from "./internal";

export class Master {
  private _endpoints: string[];
  private _connectionManager: ConnectionManager;
  private _options: Options;
  private _connection: Connection | null;
  private _endpoint_index: number;
  private _condition: Condition;

  constructor(
    endpoints: string[],
    connectionManager: ConnectionManager,
    options: Options
  ) {
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

  close(): void {
    this._disconnectFromMaster();
    this._condition.clear();
  }

  async resolveFrontend(): Promise<string> {
    const resolveFrontendRep = await this._waitAndRequest(
      this._buildResolveFrontendReq()
    );
    const endpoint = resolveFrontendRep.endpoint;
    if (typeof endpoint === "undefined") {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }
    return endpoint;
  }

  async resolveBackend(topic: string): Promise<string> {
    const resolve_backend_rep = await this._waitAndRequest(
      this._buildResolveBackendReq(topic)
    );
    const endpoint = resolve_backend_rep.endpoint;
    if (typeof endpoint === "undefined") {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }
    return endpoint;
  }

  private _connectToMaster(): void {
    this._connection = this._connectionManager.fetch(this._nextEndpoint());
    this._connection.addListener(
      Event.ON_CONNECTED,
      this._onConnectToMasterDone.bind(this)
    );
    this._connection.addListener(
      Event.ON_ERROR,
      this._onConnectToMasterFailed.bind(this)
    );
  }

  private _disconnectFromMaster() {
    if (!this._connection) {
      return;
    }
    this._connection.deleteListener(
      Event.ON_CONNECTED,
      this._onConnectToMasterDone.bind(this)
    );
    this._connection.deleteListener(
      Event.ON_ERROR,
      this._onConnectToMasterFailed.bind(this)
    );
    this._connectionManager.release(this._connection);
    this._connection = null;
  }

  private _onConnectToMasterDone() {
    this._condition.notify();
  }

  private _onConnectToMasterFailed(code: Code) {
    if (code === Code.FAILED_TO_CONNECT) {
      this._disconnectFromMaster();
      setTimeout(() => this._connectToMaster(), 1000);
    }
  }

  private _nextEndpoint() {
    this._endpoint_index += 1;
    if (this._endpoint_index >= this._endpoints.length) {
      this._endpoint_index = 0;
    }
    return this._endpoints[this._endpoint_index];
  }

  private async _waitAndRequest(msg: ProtocolMsg) {
    await this._condition.wait(this._options.defaultRoundTimeout, msg);
    if (this._connection === null) {
      throw new Error("Connection was lost");
    }
    return await this._connection.request(msg).wait();
  }

  private _buildResolveFrontendReq() {
    return new msg_types.resolve_frontend_req_t();
  }

  private _buildResolveBackendReq(topic: string) {
    return new msg_types.resolve_backend_req_t({ topic });
  }
}

export default Master;
