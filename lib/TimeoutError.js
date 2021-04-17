"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
class TimeoutError extends Error {
    constructor(message) {
        if (typeof message === "undefined") {
            message = "Timeout";
        }
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}
exports.TimeoutError = TimeoutError;
exports.default = TimeoutError;
//# sourceMappingURL=TimeoutError.js.map