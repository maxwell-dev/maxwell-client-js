import Frontend from "./Frontend";
import { Msg, Offset, OnMsg } from "./types";

export class Subscriber {
  private _frontend: Frontend;

  constructor(frontend: Frontend) {
    this._frontend = frontend;
  }

  subscribe(topic: string, offset: Offset, onMsg: OnMsg): void {
    this._frontend.subscribe(topic, offset, onMsg);
  }

  unsubscribe(topic: string): void {
    this._frontend.unsubscribe(topic);
  }

  get(topic: string, offset: Offset, limit: number): Msg[] {
    return this._frontend.get(topic, offset, limit);
  }

  commit(topic: string, offset: Offset): void {
    this._frontend.commit(topic, offset);
  }

  receive(topic: string, offset: Offset, limit: number): Msg[] {
    return this._frontend.receive(topic, offset, limit);
  }
}

export default Subscriber;
