import TimeoutError from "./TimeoutError";
import { Timer } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnFulfilled = (value: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnRejected = (reason?: any) => void;

type Executor = (resolve: OnFulfilled, reject: OnRejected) => void;

export class PromisePlus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _promise: Promise<any>;
  private _canceled: boolean;

  constructor(executor: Executor, timeout: number, msg?: unknown) {
    this._promise = this._initPromise(executor, timeout, msg);
    this._canceled = false;
  }

  then(onFulfilled: OnFulfilled): PromisePlus {
    this._promise = this._promise.then((value) => {
      if (!this._canceled) {
        return onFulfilled(value);
      }
    });
    return this;
  }

  catch(onRejected: OnRejected): PromisePlus {
    this._promise = this._promise.catch((reason) => {
      if (!this._canceled) {
        onRejected(reason);
      }
    });
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async wait(): Promise<any> {
    return await this._promise;
  }

  cancel(): void {
    this._canceled = true;
  }

  private _initPromise(executor: Executor, timeout: number, msg?: unknown) {
    let timer: Timer;
    return Promise.race([
      new Promise(executor),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          if (typeof msg === "undefined") {
            reject(new TimeoutError());
          } else if (typeof msg === "string") {
            reject(new TimeoutError(msg));
          } else {
            reject(new TimeoutError(JSON.stringify(msg).substr(0, 100)));
          }
        }, timeout);
      }),
    ])
      .then((value) => {
        clearTimeout(timer as number);
        return value;
      })
      .catch((reason) => {
        clearTimeout(timer as number);
        throw reason;
      });
  }
}

export default PromisePlus;
