import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { IEventHandler, Listenable, IConnection } from "maxwell-utils";
import { Offset, Headers, Options, MasterClient, FunctionConsumer, IConsumer, ConsumerKey } from "./internal";
export declare class WsChannel extends Listenable implements IEventHandler {
    private _masterClient;
    private _options;
    private _connection;
    private _failedToConnect;
    private _subscriberManager;
    constructor(masterClient: MasterClient, options: Required<Options>);
    close(): void;
    request(path: string, payload?: unknown, headers?: Headers): AbortablePromise<any>;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key?: ConsumerKey): boolean;
    onConnecting(connection: IConnection, ...rest: any[]): void;
    onConnected(connection: IConnection, ...rest: any[]): void;
    onDisconnecting(connection: IConnection, ...rest: any[]): void;
    onDisconnected(connection: IConnection, ...rest: any[]): void;
    onCorrupted(connection: IConnection, ...rest: any[]): void;
    private _pickEndpoint;
    private _createReqReq;
}
export default WsChannel;
