import { Frontend, IHeaders } from "./internal";

export class Requester {
  private _frontend: Frontend;

  constructor(frontend: Frontend) {
    this._frontend = frontend;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(
    path: string,
    payload?: unknown,
    headers?: IHeaders
  ): Promise<any> {
    return await this._frontend.request(path, payload, headers);
  }
}

export default Requester;
