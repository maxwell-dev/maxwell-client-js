import Frontend from "./Frontend";
import { OnAction } from "./types";

export class Watcher {
  private _frontend: Frontend;

  constructor(frontend: Frontend) {
    this._frontend = frontend;
  }

  watch(actionType: string, onAction: OnAction): void {
    this._frontend.watch(actionType, onAction);
  }

  unwatch(actionType: string): void {
    this._frontend.unwatch(actionType);
  }
}

export default Watcher;
