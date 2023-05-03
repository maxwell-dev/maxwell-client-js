import { Timer, TimeoutError } from "./internal";

type Cond = () => boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Watier = [(value: true) => void, (reason?: any) => void];

export class Condition {
  private _cond: Cond;
  private _waiters: Map<number, Watier>;
  private _waiterId: number;

  constructor(cond: Cond) {
    this._cond = cond;
    this._waiters = new Map();
    this._waiterId = 0;
  }

  async wait(timeout = 5000, msg?: string): Promise<boolean> {
    if (this._cond()) {
      return Promise.resolve(true);
    }

    let timer: Timer;
    const waiterId = this._nextWaiterId();
    return Promise.race([
      new Promise<boolean>((resolve, reject) => {
        this._waiters.set(waiterId, [resolve, reject]);
      }),
      new Promise<boolean>((_, reject) => {
        if (typeof msg === "undefined") {
          msg = `Timeout waiting: waiter ${waiterId}`;
        } else {
          msg = JSON.stringify(msg).substring(0, 100);
        }
        timer = setTimeout(() => reject(new TimeoutError(msg)), timeout);
      }),
    ])
      .then((value) => {
        clearTimeout(timer as number);
        this._waiters.delete(waiterId);
        return value;
      })
      .catch((reason) => {
        clearTimeout(timer as number);
        this._waiters.delete(waiterId);
        throw reason;
      });
  }

  notify(): void {
    this._waiters.forEach((waiter) => {
      waiter[0](true);
    });
    this.clear();
  }

  // eslint-disable-next-line
  throw(reason: any): void {
    this._waiters.forEach((waiter) => {
      waiter[1](reason);
    });
    this.clear();
  }

  clear(): void {
    this._waiters = new Map();
  }

  private _nextWaiterId() {
    return this._waiterId++;
  }
}

export default Condition;
