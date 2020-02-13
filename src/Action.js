const protocol = require("maxwell-protocol");

class Action {
  constructor(doReq, connection) {
    this._doReq = doReq;
    this._connection = connection;
  }

  get type() {
    return this._doReq.type;
  }

  get value() {
    return JSON.parse(this._doReq.value);
  }

  get source() {
    return this._doReq.source;
  }

  toString() {
    return `{type: ${this.type}, value: ${this.value}, source: ${this.source}}`;
  }

  done(value) {
    this._connection.send(this._buildDoRep(value));
  }

  failed(code, desc = "") {
    if (code < 1024) {
      throw Exception(`Code must be less than 1024, but now ${code}.`);
    }
    this._connection.send(this._buildErrorRep(code, desc));
  }

  _buildDoRep(value) {
    return protocol.do_rep_t.create({
      value: JSON.stringify(value),
      traces: this._doReq.traces
    });
  }

  _buildErrorRep(code, desc) {
    return protocol.error2_rep_t.create({
      code,
      desc: JSON.stringify(desc),
      traces: this._doReq.traces
    });
  }
}

module.exports = Action;
