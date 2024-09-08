"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerManager = void 0;
class ConsumerManager {
    constructor() {
        this._map = new Map();
    }
    setConsumer(topic, consumer) {
        let consumers = this._map.get(topic);
        if (typeof consumers === "undefined") {
            consumers = new Map();
            this._map.set(topic, consumers);
        }
        consumers.set(consumer.key(), consumer);
    }
    deleteConsumer(topic, key) {
        const consumers = this._map.get(topic);
        if (typeof consumers !== "undefined") {
            consumers.delete(key);
        }
    }
    deleteConsumers(topic) {
        this._map.delete(topic);
    }
    clear() {
        this._map.clear();
    }
    getConsumers(topic) {
        return this._map.get(topic) ?? new Map();
    }
    hasConsumers(topic) {
        return this._map.has(topic);
    }
    hasConsumer(topic, key) {
        const consumers = this._map.get(topic);
        if (typeof consumers === "undefined") {
            return false;
        }
        return consumers.has(key);
    }
}
exports.ConsumerManager = ConsumerManager;
//# sourceMappingURL=consumer-manager.js.map