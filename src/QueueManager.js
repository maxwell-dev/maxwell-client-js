const Queue = require("./Queue");

class QueueManager {

  constructor(queueCapacity) {
    this._queueCapacity = queueCapacity;
    this._map = new Map();
  }

  clear() {
    this._map.clear();
  }

  get(topic) {
    let queue = this._map.get(topic);
    if (queue === undefined) {
      queue = new Queue(this._queueCapacity);
      this._map.set(topic, queue);
    }
    return queue;
  }

  delete(topic) {
    this.get(topic).clear();
    this._map.delete(topic);
  }

}

module.exports = QueueManager;