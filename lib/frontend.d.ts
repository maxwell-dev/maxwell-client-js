import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { IEventHandler, Listenable, IConnection } from "maxwell-utils";
import { Offset, Msg, OnMsg, IHeaders, Options } from "./internal";
export declare class Frontend extends Listenable implements IEventHandler {
    private _endpoints;
    private _options;
    private _master;
    private _connection;
    private _failedToConnect;
    private _subscriptionManager;
    private _queueManager;
    private _onMsgs;
    private _pullTasks;
    constructor(endpoints: string[], options: Options);
    close(): void;
    subscribe(topic: string, offset: Offset, onMsg: OnMsg): void;
    unsubscribe(topic: string): void;
    get(topic: string, offset: Offset, limit: number): Msg[];
    commit(topic: string, offset: Offset): void;
    receive(topic: string, offset: Offset, limit: number): Msg[];
    request(path: string, payload?: unknown, headers?: IHeaders): AbortablePromise<any>;
    onConnecting(connection: IConnection, ...rest: any[]): void;
    onConnected(connection: IConnection, ...rest: any[]): void;
    onDisconnecting(connection: IConnection, ...rest: any[]): void;
    onDisconnected(connection: IConnection, ...rest: any[]): void;
    onCorrupted(connection: IConnection, ...rest: any[]): void;
    private _pickEndpoint;
    private _renewAllTask;
    private _newPullTask;
    private _deletePullTask;
    private _deleteAllPullTasks;
    private _isValidSubscription;
    private _createPullReq;
    private _createReqReq;
}
export default Frontend;
