import { Queue } from "./internal";

export class QueueManager {
  private _queueCapacity: number;
  private _map: Map<string, Queue>;

  constructor(queueCapacity: number) {
    this._queueCapacity = queueCapacity;
    this._map = new Map();
  }

  get_or_set(topic: string): Queue {
    let queue = this._map.get(topic);
    if (queue === undefined) {
      queue = new Queue(this._queueCapacity);
      this._map.set(topic, queue);
    }
    return queue;
  }

  delete(topic: string): void {
    const queue = this._map.get(topic);
    if (queue !== undefined) {
      queue.clear();
      this._map.delete(topic);
    }
  }

  clear(): void {
    this._map.clear();
  }

  has(topic: string): boolean {
    return this._map.has(topic);
  }
}

export default QueueManager;
