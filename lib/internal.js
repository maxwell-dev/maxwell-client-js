"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.ws = exports.http = exports.createEndpointPicker = exports.MasterClient = exports.buildOptions = void 0;
const options_1 = require("./options");
Object.defineProperty(exports, "buildOptions", { enumerable: true, get: function () { return options_1.buildOptions; } });
const master_client_1 = require("./master-client");
Object.defineProperty(exports, "MasterClient", { enumerable: true, get: function () { return master_client_1.MasterClient; } });
const endpoint_picker_1 = require("./endpoint-picker");
Object.defineProperty(exports, "createEndpointPicker", { enumerable: true, get: function () { return endpoint_picker_1.createEndpointPicker; } });
const ws = __importStar(require("./ws"));
exports.ws = ws;
const http = __importStar(require("./http"));
exports.http = http;
const client_1 = require("./client");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return client_1.Client; } });
//# sourceMappingURL=internal.js.map