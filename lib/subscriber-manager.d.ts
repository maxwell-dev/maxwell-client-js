import { MultiAltEndpointsConnection } from "maxwell-utils";
import { Offset, Options, ConsumerKey, IConsumer, FunctionConsumer } from "./internal";
export declare class SubscriberManager {
    private _connection;
    private _options;
    private _subscribers;
    constructor(connection: MultiAltEndpointsConnection, options: Required<Options>);
    close(): void;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key?: ConsumerKey): boolean;
}
