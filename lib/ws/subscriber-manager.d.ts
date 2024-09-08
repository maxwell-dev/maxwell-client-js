import { Options } from "../internal";
import { Offset, ConsumerKey, IConsumer, FunctionConsumer, Channel } from "./";
export declare class SubscriberManager extends Channel {
    private _connection;
    private _subscribers;
    constructor(endpoints: string[], options: Required<Options>);
    close(): void;
    subscribe(topic: string, offset: Offset, consumer: IConsumer | FunctionConsumer): boolean;
    unsubscribe(topic: string, key?: ConsumerKey): boolean;
}
