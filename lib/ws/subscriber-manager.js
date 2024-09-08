"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberManager = void 0;
const maxwell_utils_1 = require("maxwell-utils");
const _1 = require("./");
class SubscriberManager extends _1.Channel {
    constructor(endpoints, options) {
        super(endpoints, options);
        this._connection = new maxwell_utils_1.MultiAltEndpointsConnection(super.pickEndpoint.bind(this), this.options, this);
        this._subscribers = new Map();
    }
    close() {
        for (const subscriber of this._subscribers.values()) {
            subscriber.close();
        }
        this._subscribers.clear();
        this._connection.close();
    }
    subscribe(topic, offset, consumer) {
        let subscriber = this._subscribers.get(topic);
        if (typeof subscriber === "undefined") {
            subscriber = new _1.Subscriber(topic, offset, this._connection, this.options);
            this._subscribers.set(topic, subscriber);
        }
        if (typeof consumer === "function") {
            consumer = new _1.DefaultConsumer(consumer);
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