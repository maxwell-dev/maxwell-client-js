"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegatedEndpointPicker = exports.RoundRobinEndpointPicker = exports.RandomEndpointPicker = void 0;
exports.createEndpointPicker = createEndpointPicker;
const abortable_promise_1 = __importDefault(require("@xuchaoqian/abortable-promise"));
const internal_1 = require("./internal");
class RandomEndpointPicker {
    constructor(endpoints) {
        this._endpoints = endpoints;
    }
    pick() {
        return abortable_promise_1.default.resolve(this._endpoints[Math.floor(Math.random() * this._endpoints.length)]);
    }
}
exports.RandomEndpointPicker = RandomEndpointPicker;
class RoundRobinEndpointPicker {
    constructor(endpoints) {
        this._endpoints = endpoints;
        this._index = 0;
    }
    pick() {
        const endpoint = this._endpoints[this._index];
        this._index = (this._index + 1) % this._endpoints.length;
        return abortable_promise_1.default.resolve(endpoint);
    }
}
exports.RoundRobinEndpointPicker = RoundRobinEndpointPicker;
class DelegatedEndpointPicker {
    constructor(endpoints, options) {
        this._masterClient = internal_1.MasterClient.getOrCreateInstance(endpoints, options);
    }
    pick(forceMaster = false) {
        return this._masterClient.pickFrontend(forceMaster);
    }
}
exports.DelegatedEndpointPicker = DelegatedEndpointPicker;
function createEndpointPicker(endpoints, options) {
    switch (options.endpointPicker) {
        case "random":
            return new RandomEndpointPicker(endpoints);
        case "round-robin":
            return new RoundRobinEndpointPicker(endpoints);
        case "delegated":
            return new DelegatedEndpointPicker(endpoints, options);
        default:
            throw new Error(`Unknown endpoint picker: ${options.endpointPicker}`);
    }
}
//# sourceMappingURL=endpoint-picker.js.map