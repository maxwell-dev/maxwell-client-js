import { msg_types } from "maxwell-protocol";
import Connection from "./Connection";
import IAction from "./IAction";
import IHeaders from "./IHeaders";

type DoReq = typeof msg_types.do_req_t.prototype;

export class ActionHandler {
  private _doReq: DoReq;
  private _connection: Connection;

  constructor(doReq: DoReq, connection: Connection) {
    this._doReq = doReq;
    this._connection = connection;
  }

  getAction(): IAction {
    return { type: this._doReq.type, value: JSON.parse(this._doReq.value) };
  }

  getHeaders(): IHeaders {
    return {
      sourceEnabled: this._doReq.sourceEnabled,
      agent: this._doReq.source?.agent,
      endpoint: this._doReq.source?.endpoint,
    };
  }

  done(value: unknown): void {
    this._connection.send(this._buildDoRep(value));
  }

  failed(code: number, desc = ""): void {
    if (code < 1024) {
      throw new Error(`Code must be >=1024, but now ${code}.`);
    }
    this._connection.send(this._buildErrorRep(code, desc));
  }

  private _buildDoRep(value: unknown) {
    return new msg_types.do_rep_t({
      value: JSON.stringify(value),
      traces: this._doReq.traces,
    });
  }

  private _buildErrorRep(code: number, desc: string) {
    return new msg_types.error2_rep_t({
      code,
      desc: JSON.stringify(desc),
      traces: this._doReq.traces,
    });
  }
}

export default ActionHandler;
