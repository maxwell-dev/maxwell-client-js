import IAction from "./IAction";
import Frontend from "./Frontend";
import IHeaders from "./IHeaders";
export declare class Doer {
    private _frontend;
    constructor(frontend: Frontend);
    do(action: IAction, headers?: IHeaders): Promise<any>;
}
export default Doer;
