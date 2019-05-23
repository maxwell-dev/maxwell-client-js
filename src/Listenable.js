class Listenable {

  constructor() {
    this._listeners = new Map();
  }

  addListener(event, callback) {
    if (callback.name === "") {
      throw new Error("Not allowed anonymous function!");
    }
    let callbacks = this._listeners.get(event);
    if (typeof callbacks === "undefined") {
      callbacks = [];
      this._listeners.set(event, callbacks);
    }
    callbacks.push(callback)
  }

  deleteListener(event, callback) {
    let callbacks = this._listeners.get(event);
    if (typeof callbacks === "undefined") {
      return;
    }
    let index = callbacks.findIndex((callback0) => {
      return callback.name === callback0.name
    });
    if (index === -1) {
      return;
    }
    callbacks.splice(index, 1);
    if (callbacks.length <= 0) {
      this._listeners.delete(event);
    }
  }

  clear() {
    this._listeners.clear();
  }

  notify(event, result) {
    let callbacks = this._listeners.get(event);
    if (typeof callbacks === "undefined") {
      return;
    }
    callbacks.forEach(callback => {
      try {
        if (typeof result !== "undefined") {
          callback(result)
        } else {
          callback()
        }
      } catch (e) {
        console.error(`Failed to notify: reason: ${e.stack}`);
      }
    })
  }

}

module.exports = Listenable;
