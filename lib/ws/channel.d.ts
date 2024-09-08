import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Listenable, IConnection, IEventHandler } from "maxwell-utils";
import { Options, EndpointPicker } from "../internal";
export declare class Channel extends Listenable implements IEventHandler {
    protected readonly options: Required<Options>;
    protected readonly endpointPicker: EndpointPicker;
    private _failedToConnect;
    constructor(endpoints: string[], options: Required<Options>);
    onConnecting(connection: IConnection, ...rest: any[]): void;
    onConnected(connection: IConnection, ...rest: any[]): void;
    onDisconnecting(connection: IConnection, ...rest: any[]): void;
    onDisconnected(connection: IConnection, ...rest: any[]): void;
    onCorrupted(connection: IConnection, ...rest: any[]): void;
    onBecameUnhealthy(connection: IConnection, ...rest: any[]): void;
    onBecameHealthy(connection: IConnection, ...rest: any[]): void;
    onBecameIdle(connection: IConnection, ...rest: any[]): void;
    onBecameActive(connection: IConnection, ...rest: any[]): void;
    protected pickEndpoint(): AbortablePromise<string>;
}
export default Channel;
