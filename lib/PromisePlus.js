"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromisePlus = void 0;
const TimeoutError_1 = __importDefault(require("./TimeoutError"));
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
                        reject(new TimeoutError_1.default());
                    }
                    else if (typeof msg === "string") {
                        reject(new TimeoutError_1.default(msg));
                    }
                    else {
                        reject(new TimeoutError_1.default(JSON.stringify(msg).substr(0, 100)));
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
//# sourceMappingURL=PromisePlus.js.map