import { ConnectionPoolOptions } from "maxwell-utils";
export interface Options extends ConnectionPoolOptions {
    endpointPicker?: "random" | "round-robin" | "delegated";
    localStoreEnabled?: boolean;
    pullInterval?: number;
    pullLimit?: number;
    queueCapacity?: number;
    consumeBatchSize?: number;
    consumeBatchInterval?: number;
}
export declare function buildOptions(options?: Options): Required<Options>;
export default Options;
