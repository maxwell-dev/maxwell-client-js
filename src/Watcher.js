class Watcher {
  constructor(frontend) {
    this._frontend = frontend;
  }

  watch(actionType, callback) {
    this._frontend.watch(actionType, callback);
  }

  unwatch(actionType) {
    this._frontend.unwatch(actionType);
  }
}

module.exports = Watcher;
