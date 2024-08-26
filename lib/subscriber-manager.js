"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberManager = void 0;
const internal_1 = require("./internal");
class SubscriberManager {
    constructor(connection, options) {
        this._connection = connection;
        this._options = options;
        this._subscribers = new Map();
    }
    close() {
        for (const subscriber of this._subscribers.values()) {
            subscriber.close();
        }
        this._subscribers.clear();
    }
    subscribe(topic, offset, consumer) {
        let subscriber = this._subscribers.get(topic);
        if (typeof subscriber === "undefined") {
            subscriber = new internal_1.Subscriber(topic, offset, this._connection, this._options);
            this._subscribers.set(topic, subscriber);
        }
        if (typeof consumer === "function") {
            consumer = new internal_1.DefaultConsumer(consumer);
        }
        const result = subscriber.addConsumer(consumer);
        if (!result) {
            console.debug(`Consumer already exists: topic: ${topic}, key: ${consumer.key().toString()}`);
        }
        return result;
    }
    unsubscribe(topic, key) {
        const subscriber = this._subscribers.get(topic);
        if (typeof subscriber === "undefined") {
            console.debug(`Subscriber not found: topic: ${topic}`);
            return false;
        }
        if (typeof key === "undefined") {
            console.debug(`Delete all consumers: topic: ${topic}`);
            this._subscribers.delete(topic);
            subscriber.close();
            return true;
        }
        const result = subscriber.deleteConsumer(key);
        if (!result) {
            console.debug(`Consumer not found: topic: ${topic}, key: ${key.toString()}`);
        }
        if (subscriber.countConsumers() < 1) {
            console.debug(`No consumer left, delete it: topic: ${topic}`);
            this._subscribers.delete(topic);
            subscriber.close();
        }
        return result;
    }
}
exports.SubscriberManager = SubscriberManager;
//# sourceMappingURL=subscriber-manager.js.map