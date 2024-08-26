import { msg_types } from "maxwell-protocol";
import { MultiAltEndpointsConnection } from "maxwell-utils";
import { Offset, Options, ConsumerKey, IConsumer } from "./internal";
export declare class Subscriber {
    private readonly _topic;
    private readonly _connection;
    private readonly _options;
    private _queue;
    private _queueCond;
    private _consumers;
    private _nextOffset;
    private _shouldRun;
    private _currPullTask;
    private _currConsumeTask;
    constructor(topic: string, offset: Offset, connection: MultiAltEndpointsConnection, options: Required<Options>);
    close(): void;
    addConsumer(consumer: IConsumer): boolean;
    deleteConsumer(key: ConsumerKey): boolean;
    hasConsumer(key: ConsumerKey): boolean;
    countConsumers(): number;
    _repeatPull(): Promise<void>;
    _pull(): Promise<void>;
    _repeatConsume(): Promise<void>;
    _consume(): Promise<void>;
    _createPullReq(): typeof msg_types.pull_req_t.prototype;
    _sleep(ms: number): Promise<void>;
}
