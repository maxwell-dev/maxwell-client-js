"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requester = void 0;
const abortable_promise_1 = require("@xuchaoqian/abortable-promise");
const internal_1 = require("../internal");
class Requester {
    constructor(endpoints, options) {
        this._options = options;
        this._endpointPicker = (0, internal_1.createEndpointPicker)(endpoints, options);
    }
    close() { }
    get(path, options) {
        if (typeof options === "undefined") {
            options = { method: "GET" };
        }
        else {
            options.method = "GET";
        }
        return this.request(path, options);
    }
    delete(path, options) {
        if (typeof options === "undefined") {
            options = { method: "DELETE" };
        }
        else {
            options.method = "DELETE";
        }
        return this.request(path, options);
    }
    head(path, options) {
        if (typeof options === "undefined") {
            options = { method: "HEAD" };
        }
        else {
            options.method = "HEAD";
        }
        return this.request(path, options);
    }
    options(path, options) {
        if (typeof options === "undefined") {
            options = { method: "OPTIONS" };
        }
        else {
            options.method = "OPTIONS";
        }
        return this.request(path, options);
    }
    post(path, options) {
        if (typeof options === "undefined") {
            options = { method: "POST" };
        }
        else {
            options.method = "POST";
        }
        return this.request(path, options);
    }
    put(path, options) {
        if (typeof options === "undefined") {
            options = { method: "PUT" };
        }
        else {
            options.method = "PUT";
        }
        return this.request(path, options);
    }
    patch(path, options) {
        if (typeof options === "undefined") {
            options = { method: "PATCH" };
        }
        else {
            options.method = "PATCH";
        }
        return this.request(path, options);
    }
    request(path, options) {
        if (typeof options === "undefined") {
            options = {};
        }
        const fetchOptions = {
            method: options.method ?? "GET",
            mode: "cors",
            credentials: "omit",
        };
        if (options.headers) {
            fetchOptions.headers = options.headers;
        }
        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }
        if (options.signal) {
            let signal = options.signal;
            if (options.timeout) {
                if (!(signal instanceof abortable_promise_1.AbortSignalPlus)) {
                    signal = abortable_promise_1.AbortSignalPlus.from(signal);
                }
                signal.timeout(options.timeout);
            }
            fetchOptions.signal = signal;
        }
        else {
            const controller = new abortable_promise_1.AbortControllerPlus();
            const signal = controller.signal;
            if (options.timeout) {
                signal.timeout(options.timeout);
            }
            fetchOptions.signal = signal;
        }
        return new abortable_promise_1.AbortablePromise((resolve, reject) => {
            this._buildURL(path, options?.params)
                .then((url) => fetch(url, fetchOptions))
                .then(resolve)
                .catch(reject);
        }, fetchOptions.signal);
    }
    async _buildURL(path, params) {
        const scheme = this._options.sslEnabled ? "https://" : "http://";
        const host = await this._endpointPicker.pick();
        const baseURL = `${scheme}${host}`;
        const url = new URL(path, baseURL);
        if (params) {
            if (params instanceof URLSearchParams) {
                url.search = params.toString();
            }
            else {
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
            }
        }
        return url;
    }
}
exports.Requester = Requester;
//# sourceMappingURL=requester.js.map