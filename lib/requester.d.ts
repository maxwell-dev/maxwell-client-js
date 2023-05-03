import { Frontend, IHeaders } from "./internal";
export declare class Requester {
    private _frontend;
    constructor(frontend: Frontend);
    request(path: string, payload?: unknown, headers?: IHeaders): Promise<any>;
}
export default Requester;
