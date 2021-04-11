import ConnectionManager from "./ConnectionManager";
import Options from "./Options";
export declare class Master {
    private _endpoints;
    private _connectionManager;
    private _options;
    private _connection;
    private _endpoint_index;
    private _condition;
    constructor(endpoints: string[], connectionManager: ConnectionManager, options: Options);
    close(): void;
    resolveFrontend(): Promise<string>;
    resolveBackend(topic: string): Promise<string>;
    private _connectToMaster;
    private _disconnectFromMaster;
    private _onConnectToMasterDone;
    private _onConnectToMasterFailed;
    private _nextEndpoint;
    private _waitAndRequest;
    private _buildResolveFrontendReq;
    private _buildResolveBackendReq;
}
export default Master;
