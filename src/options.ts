import {
  ConnectionPoolOptions,
  buildConnectionPoolOptions,
} from "maxwell-utils";

export interface Options extends ConnectionPoolOptions {
  endpointPicker?: "random" | "round-robin" | "delegated";
  localStoreEnabled?: boolean;
  pullInterval?: number;
  pullLimit?: number;
  queueCapacity?: number;
  consumeBatchSize?: number;
  consumeBatchInterval?: number;
}

export function buildOptions(options?: Options): Required<Options> {
  if (typeof options === "undefined") {
    options = {};
  }
  return {
    ...buildConnectionPoolOptions(options),
    endpointPicker: options.endpointPicker ?? "delegated",
    localStoreEnabled: options.localStoreEnabled ?? true,
    pullInterval: options.pullInterval ?? 0,
    pullLimit: options.pullLimit ?? 128,
    queueCapacity: options.queueCapacity ?? 512,
    consumeBatchSize: options.consumeBatchSize ?? 64,
    consumeBatchInterval: options.consumeBatchInterval ?? 0,
  } as Required<Options>;
}

export default Options;
