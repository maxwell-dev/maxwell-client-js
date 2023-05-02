import { Offset } from "./internal";

export class SubscriptionManager {
  private _pendings: Map<string, Offset>;
  private _doings: Map<string, Offset>;

  constructor() {
    this._pendings = new Map();
    this._doings = new Map();
  }

  addSubscription(topic: string, offset: Offset): void {
    this._pendings.set(topic, offset); // will pull from offset
    this._doings.delete(topic);
  }

  toDoing(topic: string, offset?: Offset): void {
    if (typeof offset === "undefined") {
      offset = this._pendings.get(topic);
      if (typeof offset === "undefined") {
        throw new Error(`No such pending topic: ${topic}`);
      }
    }
    this._doings.set(topic, offset); // will pull from offset
    this._pendings.delete(topic);
  }

  toPendings(): void {
    for (const s of this._doings.entries()) {
      this.addSubscription(s[0], s[1]);
    }
  }

  deleteSubscription(topic: string): void {
    this._pendings.delete(topic);
    this._doings.delete(topic);
  }

  clear(): void {
    this._pendings.clear();
    this._doings.clear();
  }

  getAllPendings(): IterableIterator<[string, Offset]> {
    return this._pendings.entries();
  }

  getAllDoings(): IterableIterator<[string, Offset]> {
    return this._doings.entries();
  }

  has(topic: string): boolean {
    return this._pendings.has(topic) || this._doings.has(topic);
  }
}

export default SubscriptionManager;
