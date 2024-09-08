"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConsumer = exports.DEFAULT_CONSUMER_KEY = void 0;
exports.DEFAULT_CONSUMER_KEY = Symbol("default");
class DefaultConsumer {
    constructor(onMsg) {
        this.onMsg = onMsg;
    }
    key() {
        return exports.DEFAULT_CONSUMER_KEY;
    }
}
exports.DefaultConsumer = DefaultConsumer;
//# sourceMappingURL=consumer.js.map