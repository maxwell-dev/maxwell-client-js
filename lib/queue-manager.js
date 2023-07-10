"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const internal_1 = require("./internal");
class QueueManager {
    constructor(queueCapacity) {
        this._queueCapacity = queueCapacity;
        this._map = new Map();
    }
    get_or_set(topic) {
        let queue = this._map.get(topic);
        if (queue === undefined) {
            queue = new internal_1.Queue(this._queueCapacity);
            this._map.set(topic, queue);
        }
        return queue;
    }
    delete(topic) {
        const queue = this._map.get(topic);
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
exports.QueueManager = QueueManager;
exports.default = QueueManager;
//# sourceMappingURL=queue-manager.js.map