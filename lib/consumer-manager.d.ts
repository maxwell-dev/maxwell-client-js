import { ConsumerKey, IConsumer } from "./internal";
export declare class ConsumerManager {
    private _map;
    constructor();
    setConsumer(topic: string, consumer: IConsumer): void;
    deleteConsumer(topic: string, key: ConsumerKey): void;
    deleteConsumers(topic: string): void;
    clear(): void;
    getConsumers(topic: string): Map<string, IConsumer>;
    hasConsumers(topic: string): boolean;
    hasConsumer(topic: string, key: ConsumerKey): boolean;
}
