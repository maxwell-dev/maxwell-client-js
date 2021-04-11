var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import TimeoutError from "./TimeoutError";
export class PromisePlus {
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
    wait() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._promise;
        });
    }
    cancel() {
        this._canceled = true;
    }
    _initPromise(executor, timeout, msg) {
        let timer;
        return Promise.race([
            new Promise(executor),
            new Promise((_, reject) => {
                timer = setTimeout(() => {
                    if (typeof msg === "undefined") {
                        reject(new TimeoutError());
                    }
                    else if (typeof msg === "string") {
                        reject(new TimeoutError(msg));
                    }
                    else {
                        reject(new TimeoutError(JSON.stringify(msg).substr(0, 100)));
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
export default PromisePlus;
//# sourceMappingURL=PromisePlus.js.map