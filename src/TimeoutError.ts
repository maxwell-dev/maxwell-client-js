export class TimeoutError extends Error {
  constructor(message?: string) {
    if (typeof message === "undefined") {
      message = "Timeout";
    }
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export default TimeoutError;
