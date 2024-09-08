"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptions = buildOptions;
const maxwell_utils_1 = require("maxwell-utils");
function buildOptions(options) {
    if (typeof options === "undefined") {
        options = {};
    }
    return {
        ...(0, maxwell_utils_1.buildConnectionPoolOptions)(options),
        endpointPicker: options.endpointPicker ?? "delegated",
        localStoreEnabled: options.localStoreEnabled ?? true,
        pullInterval: options.pullInterval ?? 0,
        pullLimit: options.pullLimit ?? 128,
        queueCapacity: options.queueCapacity ?? 512,
        consumeBatchSize: options.consumeBatchSize ?? 64,
        consumeBatchInterval: options.consumeBatchInterval ?? 0,
    };
}
//# sourceMappingURL=options.js.map