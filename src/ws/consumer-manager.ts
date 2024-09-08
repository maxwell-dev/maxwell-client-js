import { ConsumerKey, IConsumer } from "./";

export class ConsumerManager {
  private _map: Map<string, Map<ConsumerKey, IConsumer>>; // {topic: {key: consumer}}

  constructor() {
    this._map = new Map();
  }

  setConsumer(topic: string, consumer: IConsumer): void {
    let consumers = this._map.get(topic);
    if (typeof consumers === "undefined") {
      consumers = new Map();
      this._map.set(topic, consumers);
    }
    consumers.set(consumer.key(), consumer);
  }

  deleteConsumer(topic: string, key: ConsumerKey): void {
    const consumers = this._map.get(topic);
    if (typeof consumers !== "undefined") {
      consumers.delete(key);
    }
  }

  deleteConsumers(topic: string): void {
    this._map.delete(topic);
  }

  clear(): void {
    this._map.clear();
  }

  getConsumers(topic: string): Map<string, IConsumer> {
    return this._map.get(topic) ?? new Map();
  }

  hasConsumers(topic: string): boolean {
    return this._map.has(topic);
  }

  hasConsumer(topic: string, key: ConsumerKey): boolean {
    const consumers = this._map.get(topic);
    if (typeof consumers === "undefined") {
      return false;
    }
    return consumers.has(key);
  }
}
