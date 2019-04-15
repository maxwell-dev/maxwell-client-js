class Doer {

  constructor(frontend) {
    this._frontend = frontend;
  }

  async do(action, params={}) {
    return await this._frontend.do(action, params);
  }

}

module.exports = Doer;
