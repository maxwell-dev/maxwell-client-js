"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionHandler = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
class ActionHandler {
    constructor(doReq, connection) {
        this._doReq = doReq;
        this._connection = connection;
    }
    getAction() {
        return { type: this._doReq.type, value: JSON.parse(this._doReq.value) };
    }
    getHeaders() {
        var _a, _b;
        return {
            sourceEnabled: this._doReq.sourceEnabled,
            agent: (_a = this._doReq.source) === null || _a === void 0 ? void 0 : _a.agent,
            endpoint: (_b = this._doReq.source) === null || _b === void 0 ? void 0 : _b.endpoint,
        };
    }
    done(value) {
        this._connection.send(this._buildDoRep(value));
    }
    failed(code, desc = "") {
        if (code < 1024) {
            throw new Error(`Code must be >=1024, but now ${code}.`);
        }
        this._connection.send(this._buildErrorRep(code, desc));
    }
    _buildDoRep(value) {
        return new maxwell_protocol_1.msg_types.do_rep_t({
            value: JSON.stringify(value),
            traces: this._doReq.traces,
        });
    }
    _buildErrorRep(code, desc) {
        return new maxwell_protocol_1.msg_types.error2_rep_t({
            code,
            desc: JSON.stringify(desc),
            traces: this._doReq.traces,
        });
    }
}
exports.ActionHandler = ActionHandler;
exports.default = ActionHandler;
//# sourceMappingURL=ActionHandler.js.map