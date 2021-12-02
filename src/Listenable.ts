// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Event = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (result?: Result) => void;

export class Listenable {
  private listeners: Map<Event, Callback[]>;

  constructor() {
    this.listeners = new Map();
  }

  addListener(event: Event, callback: Callback): void {
    if (callback.name === "") {
      throw new Error("Not support anonymous function!");
    }
    let callbacks = this.listeners.get(event);
    if (typeof callbacks === "undefined") {
      callbacks = [];
      this.listeners.set(event, callbacks);
    }
    const index = callbacks.findIndex((callback0) => {
      return callback.name === callback0.name;
    });
    if (index === -1) {
      callbacks.push(callback);
    }
  }

  deleteListener(event: Event, callback: Callback): void {
    const callbacks = this.listeners.get(event);
    if (typeof callbacks === "undefined") {
      return;
    }
    const index = callbacks.findIndex((callback0) => {
      return callback.name === callback0.name;
    });
    if (index === -1) {
      return;
    }
    callbacks.splice(index, 1);
    if (callbacks.length <= 0) {
      this.listeners.delete(event);
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  notify(event: Event, result?: Result): void {
    const callbacks = this.listeners.get(event);
    if (typeof callbacks === "undefined") {
      return;
    }
    const callback2 = [...callbacks];
    callback2.forEach((callback) => {
      try {
        if (typeof result !== "undefined") {
          callback(result);
        } else {
          callback();
        }
      } catch (e: any) {
        console.error(`Failed to notify: reason: ${e.stack}`);
      }
    });
  }
}

export default Listenable;
