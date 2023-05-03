import { Frontend, Msg, Offset, OnMsg } from "./internal";
export declare class Subscriber {
    private _frontend;
    constructor(frontend: Frontend);
    subscribe(topic: string, offset: Offset, onMsg: OnMsg): void;
    unsubscribe(topic: string): void;
    get(topic: string, offset: Offset, limit: number): Msg[];
    commit(topic: string, offset: Offset): void;
    receive(topic: string, offset: Offset, limit: number): Msg[];
}
export default Subscriber;
