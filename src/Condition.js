const TimeoutError = require("./TimeoutError");

class Condition {

  constructor(cond) {
    this._cond = cond;
    this._waiters = new Map();
    this._waiterId = 0;
  }

  wait(timeout = 5000, msg = '') {
    if (this._cond()) {
      return Promise.resolve(true);
    }
    let timer = null;
    let waiterId = this._nextWaiterId();
    return Promise.race([
      new Promise((resolve, reject) => {
        this._waiters.set(waiterId, [resolve, reject]);
      }),
      new Promise((_, reject) => {
        if (msg === '') {
          msg = `Waiter ${waiterId}`;
        } else {
          msg = JSON.stringify(msg);
        }
        timer = setTimeout(
            () => reject(new TimeoutError(msg)),
            timeout
        );
      })
    ]).then(value => {
      clearTimeout(timer);
      return value;
    }).catch(reason => {
      clearTimeout(timer);
      this._waiters.delete(waiterId);
      throw reason;
    })
  }

  notify() {
    this._waiters.forEach(waiter => {
      waiter[0]();
    });
    this.clear();
  }

  throw(reason) {
    this._waiters.forEach(waiter => {
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

module.exports = Condition;
