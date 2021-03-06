"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = void 0;
const TimeoutError_1 = __importDefault(require("./TimeoutError"));
class Condition {
    constructor(cond) {
        this._cond = cond;
        this._waiters = new Map();
        this._waiterId = 0;
    }
    wait(timeout = 5000, msg) {
        if (this._cond()) {
            return Promise.resolve(true);
        }
        let timer;
        const waiterId = this._nextWaiterId();
        return Promise.race([
            new Promise((resolve, reject) => {
                this._waiters.set(waiterId, [resolve, reject]);
            }),
            new Promise((_, reject) => {
                if (typeof msg === "undefined") {
                    msg = `Timeout waiting: waiter ${waiterId}`;
                }
                else {
                    msg = JSON.stringify(msg).substr(0, 100);
                }
                timer = setTimeout(() => reject(new TimeoutError_1.default(msg)), timeout);
            }),
        ])
            .then((value) => {
            clearTimeout(timer);
            this._waiters.delete(waiterId);
            return value;
        })
            .catch((reason) => {
            clearTimeout(timer);
            this._waiters.delete(waiterId);
            throw reason;
        });
    }
    notify() {
        this._waiters.forEach((waiter) => {
            waiter[0](true);
        });
        this.clear();
    }
    throw(reason) {
        this._waiters.forEach((waiter) => {
            waiter[1](reason);
        });
        this.clear();
    }
    clear() {
        this._waiters = new Map();
    }
    _nextWaiterId() {
        return this._waiterId++;
    }
}
exports.Condition = Condition;
exports.default = Condition;
//# sourceMappingURL=Condition.js.map