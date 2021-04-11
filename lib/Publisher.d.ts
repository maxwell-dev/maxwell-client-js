import ConnectionManager from "./ConnectionManager";
import Options from "./Options";
export declare class Publisher {
    private _endpoints;
    private _connectionManager;
    private _options;
    private _connections;
    constructor(endpoints: string[], connectionManager: ConnectionManager, options: Options);
    close(): void;
    publish(topic: string, value: Uint8Array): Promise<void>;
    private _resolveEndpoint;
    private _connectToBackend;
    private _disconnectFromBackend;
    private _publish;
    private _buildPublishReq;
}
