const Queue = require("./Queue");

class QueueManager {
  constructor(queueCapacity) {
    this._queueCapacity = queueCapacity;
    this._map = new Map();
  }

  get_or_set(topic) {
    let queue = this._map.get(topic);
    if (queue === undefined) {
      queue = new Queue(this._queueCapacity);
      this._map.set(topic, queue);
    }
    return queue;
  }

  delete(topic) {
    let queue = this._map.get(topic);
    if (queue !== undefined) {
      queue.clear();
      this._map.delete(topic);
    }
  }

  clear() {
    this._map.clear();
  }

  has(topic) {
    return this._map.has(topic);
  }
}

module.exports = QueueManager;
