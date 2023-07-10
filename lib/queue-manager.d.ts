import { Queue } from "./internal";
export declare class QueueManager {
    private _queueCapacity;
    private _map;
    constructor(queueCapacity: number);
    get_or_set(topic: string): Queue;
    delete(topic: string): void;
    clear(): void;
    has(topic: string): boolean;
}
export default QueueManager;
