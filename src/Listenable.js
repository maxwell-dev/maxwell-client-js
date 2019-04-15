class Listenable {

  constructor() {
    this._listeners = [];
  }

  addListener(event, callback) {
    let callbacks = this._listeners[event];
    if (typeof callbacks === "undefined") {
      callbacks = [];
      this._listeners[event] = callbacks;
    }
    callbacks.push(callback)
  }

  deleteListener(event, callback) {
    let callbacks = this._listeners[event];
    if (typeof callbacks === "undefined") {
      return;
    }
    callbacks.splice(callbacks.indexOf(callback), 1)
  }

  notify(event, result) {
    let callbacks = this._listeners[event];
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
