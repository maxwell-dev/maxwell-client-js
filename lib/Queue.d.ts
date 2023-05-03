import { Msg, Offset } from "./internal";
export declare class Queue {
    private _capacity;
    private _array;
    constructor(capacity: number);
    put(msgs: Msg[]): void;
    deleteFirst(): void;
    deleteTo(offset: Offset): void;
    clear(): void;
    getFrom(offset: Offset, limit: number): Msg[];
    size(): number;
    isFull(): boolean;
    firstOffset(): Offset;
    lastOffset(): Offset;
    minIndexFrom(offset: Offset): number;
    maxIndexTo(offset: Offset): number;
}
export default Queue;
