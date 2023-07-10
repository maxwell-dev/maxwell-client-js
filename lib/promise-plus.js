"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromisePlus = void 0;
const internal_1 = require("./internal");
class PromisePlus {
    constructor(executor, timeout, msg) {
        this._promise = this._initPromise(executor, timeout, msg);
        this._canceled = false;
    }
    then(onFulfilled) {
        this._promise = this._promise.then((value) => {
            if (!this._canceled) {
                return onFulfilled(value);
            }
        });
        return this;
    }
    catch(onRejected) {
        this._promise = this._promise.catch((reason) => {
            if (!this._canceled) {
                onRejected(reason);
            }
        });
        return this;
    }
    async wait() {
        return await this._promise;
    }
    cancel() {
        this._canceled = true;
    }
    async _initPromise(executor, timeout, msg) {
        let timer;
        return Promise.race([
            new Promise(executor),
            new Promise((_, reject) => {
                timer = setTimeout(() => {
                    if (typeof msg === "undefined") {
                        reject(new internal_1.TimeoutError());
                    }
                    else if (typeof msg === "string") {
                        reject(new internal_1.TimeoutError(msg));
                    }
                    else {
                        reject(new internal_1.TimeoutError(JSON.stringify(msg).substring(0, 100)));
                    }
                }, timeout);
            }),
        ])
            .then((value) => {
            clearTimeout(timer);
            return value;
        })
            .catch((reason) => {
            clearTimeout(timer);
            throw reason;
        });
    }
}
exports.PromisePlus = PromisePlus;
exports.default = PromisePlus;
//# sourceMappingURL=promise-plus.js.map