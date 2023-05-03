import { ConnectionManager, Options } from "./internal";
export declare class Master {
    private _endpoints;
    private _connectionManager;
    private _options;
    private _connection;
    private _endpoint_index;
    private _condition;
    constructor(endpoints: string[], connectionManager: ConnectionManager, options: Options);
    close(): void;
    assignFrontend(): Promise<string>;
    private _connectToMaster;
    private _disconnectFromMaster;
    private _onConnectToMasterDone;
    private _onConnectToMasterFailed;
    private _nextEndpoint;
    private _waitAndRequest;
    private _buildAssignFrontendReq;
}
export default Master;
