"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requester = void 0;
class Requester {
    constructor(frontend) {
        this._frontend = frontend;
    }
    async request(path, payload, headers) {
        return await this._frontend.request(path, payload, headers);
    }
}
exports.Requester = Requester;
exports.default = Requester;
//# sourceMappingURL=requester.js.map