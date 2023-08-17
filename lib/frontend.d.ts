import { Offset, Msg, OnMsg, IHeaders, Options, Listenable, ConnectionManager } from "./internal";
export declare class Frontend extends Listenable {
    private _endpoints;
    private _connectionManager;
    private _options;
    private _subscriptionManager;
    private _queueManager;
    private _onMsgs;
    private _pullTasks;
    private _master;
    private _connection;
    private _endpointIndex;
    private _failedToConnect;
    private _condition;
    constructor(endpoints: string[], connectionManager: ConnectionManager, options: Options);
    close(): void;
    subscribe(topic: string, offset: Offset, onMsg: OnMsg): void;
    unsubscribe(topic: string): void;
    get(topic: string, offset: Offset, limit: number): Msg[];
    commit(topic: string, offset: Offset): void;
    receive(topic: string, offset: Offset, limit: number): Msg[];
    request(path: string, payload?: unknown, headers?: IHeaders): Promise<any>;
    private _connectToFrontend;
    private _disconnectFromFrontend;
    private _onConnectToFrontendDone;
    private _onConnectToFrontendFailed;
    private _onDisconnectFromFrontendDone;
    private _isConnectionOpen;
    private _assignEndpoint;
    private _nextEndpoint;
    private _renewAllTask;
    private _newPullTask;
    private _deletePullTask;
    private _deleteAllPullTasks;
    private _isValidSubscription;
    private _waitAndRequest;
    private _createPullReq;
    private _createReqReq;
}
export default Frontend;
