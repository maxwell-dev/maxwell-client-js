declare type OnFulfilled = (value: any) => void;
declare type OnRejected = (reason?: any) => void;
declare type Executor = (resolve: OnFulfilled, reject: OnRejected) => void;
export declare class PromisePlus {
    private _promise;
    private _canceled;
    constructor(executor: Executor, timeout: number, msg?: unknown);
    then(onFulfilled: OnFulfilled): PromisePlus;
    catch(onRejected: OnRejected): PromisePlus;
    wait(): Promise<any>;
    cancel(): void;
    private _initPromise;
}
export default PromisePlus;
