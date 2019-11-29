const TimeoutError = require("./TimeoutError");

class PromisePlus {

  constructor(executor, timeout) {
    this._initPromise(executor, timeout);
    this._canceled = false;
  }

  then(onFulfilled) {
    this._promise = this._promise.then(value => {
      if (!this._canceled) {
        return onFulfilled(value);
      }
    });
    return this;
  }

  catch(onRejected) {
    this._promise = this._promise.catch(reason => {
      if (!this._canceled) {
        onRejected(reason)
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

  _initPromise(executor, timeout) {
    let timer = null;
    this._promise = Promise.race([
      new Promise(executor),
      new Promise((_, reject) => {
        if (typeof Array.isArray(timeout)) {
          timer = setTimeout(
              () => {
                let msg = "";
                let reason = timeout[1];
                if (typeof reason.__proto__ !== "undefined"
                    && typeof reason.__proto__.$type !== "undefined") {
                  msg += `[${reason.__proto__.$type}]`;
                }
                msg += JSON.stringify(reason).substr(0, 100);
                reject(new TimeoutError(msg));
              },
              timeout[0]
          );
        } else {
          timer = setTimeout(
            () => reject(new TimeoutError()),
            timeout
          );
        }
      }),
    ]).then(value => {
      clearTimeout(timer);
      return value;
    }).catch(reason => {
      clearTimeout(timer);
      throw reason;
    })
  }

}

module.exports = PromisePlus;
