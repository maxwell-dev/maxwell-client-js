import { IAction, Frontend, IHeaders } from "./internal";

export class Requester {
  private _frontend: Frontend;

  constructor(frontend: Frontend) {
    this._frontend = frontend;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(action: IAction, headers: IHeaders = {}): Promise<any> {
    return await this._frontend.request(action, headers);
  }
}

export default Requester;
