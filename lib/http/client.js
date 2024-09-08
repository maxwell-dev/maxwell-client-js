"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const internal_1 = require("../internal");
const _1 = require("./");
class Client {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = (0, internal_1.buildOptions)(options);
        this._requester = new _1.Requester(this._endpoints, this._options);
    }
    close() {
        this._requester.close();
    }
    get(path, options) {
        return this._requester.get(path, options);
    }
    delete(path, options) {
        return this._requester.delete(path, options);
    }
    head(path, options) {
        return this._requester.head(path, options);
    }
    options(path, options) {
        return this._requester.options(path, options);
    }
    post(path, options) {
        return this._requester.post(path, options);
    }
    put(path, options) {
        return this._requester.put(path, options);
    }
    patch(path, options) {
        return this._requester.patch(path, options);
    }
    request(path, options) {
        return this._requester.request(path, options);
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map