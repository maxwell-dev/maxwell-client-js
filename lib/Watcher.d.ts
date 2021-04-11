import Frontend from "./Frontend";
import { OnAction } from "./types";
export declare class Watcher {
    private _frontend;
    constructor(frontend: Frontend);
    watch(actionType: string, onAction: OnAction): void;
    unwatch(actionType: string): void;
}
export default Watcher;
