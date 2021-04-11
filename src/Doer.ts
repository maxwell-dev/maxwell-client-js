import IAction from "./IAction";
import Frontend from "./Frontend";
import IHeaders from "./IHeaders";

export class Doer {
  private _frontend: Frontend;

  constructor(frontend: Frontend) {
    this._frontend = frontend;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async do(action: IAction, headers: IHeaders = {}): Promise<any> {
    return await this._frontend.do(action, headers);
  }
}

export default Doer;
