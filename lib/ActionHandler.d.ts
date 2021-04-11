import { msg_types } from "maxwell-protocol";
import Connection from "./Connection";
import IAction from "./IAction";
import IHeaders from "./IHeaders";
declare type DoReq = typeof msg_types.do_req_t.prototype;
export declare class ActionHandler {
    private _doReq;
    private _connection;
    constructor(doReq: DoReq, connection: Connection);
    getAction(): IAction;
    getHeaders(): IHeaders;
    done(value: unknown): void;
    failed(code: number, desc?: string): void;
    private _buildDoRep;
    private _buildErrorRep;
}
export default ActionHandler;
