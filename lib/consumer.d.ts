import { Msg } from "./internal";
export type ConsumerKey = string | symbol;
export declare const DEFAULT_CONSUMER_KEY: unique symbol;
export interface IConsumer {
    key(): ConsumerKey;
    onMsg(msgs?: Msg[], key?: ConsumerKey, topic?: string): Promise<void>;
}
export declare class DefaultConsumer implements IConsumer {
    constructor(onMsg: (msgs?: Msg[], key?: ConsumerKey, topic?: string) => Promise<void>);
    key(): ConsumerKey;
    onMsg: (msgs?: Msg[], key?: ConsumerKey, topic?: string) => Promise<void>;
}
export type FunctionConsumer = (msgs?: Msg[], key?: ConsumerKey, topic?: string) => Promise<void>;
