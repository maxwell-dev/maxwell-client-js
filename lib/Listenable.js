"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listenable = void 0;
class Listenable {
    constructor() {
        this.listeners = new Map();
    }
    addListener(event, callback) {
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
    deleteListener(event, callback) {
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
    clear() {
        this.listeners.clear();
    }
    notify(event, result) {
        const callbacks = this.listeners.get(event);
        if (typeof callbacks === "undefined") {
            return;
        }
        const callback2 = [...callbacks];
        callback2.forEach((callback) => {
            try {
                if (typeof result !== "undefined") {
                    callback(result);
                }
                else {
                    callback();
                }
            }
            catch (e) {
                console.error(`Failed to notify: reason: ${e.stack}`);
            }
        });
    }
}
exports.Listenable = Listenable;
exports.default = Listenable;
//# sourceMappingURL=listenable.js.map