import { Offset } from "./internal";
export declare class SubscriptionManager {
    private _pendings;
    private _doings;
    constructor();
    addSubscription(topic: string, offset: Offset): void;
    toDoing(topic: string, offset?: Offset): void;
    toPendings(): void;
    deleteSubscription(topic: string): void;
    clear(): void;
    getAllPendings(): IterableIterator<[string, Offset]>;
    getAllDoings(): IterableIterator<[string, Offset]>;
    has(topic: string): boolean;
}
export default SubscriptionManager;
