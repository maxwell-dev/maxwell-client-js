"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = void 0;
const cross_fetch_1 = require("cross-fetch");
const abortable_promise_1 = require("@xuchaoqian/abortable-promise");
const localstore_1 = require("@xuchaoqian/localstore");
const maxwell_utils_1 = require("maxwell-utils");
const CACHE_KEY = "maxwell-client.frontend-endpoints";
const CACHE_TTL = 60 * 60 * 24;
class Master {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = options;
        this._endpoint_index = -1;
        this._localstore = new localstore_1.Localstore();
    }
    pickFrontend(force = false) {
        return abortable_promise_1.AbortablePromise.from(this.pickFrontends(force)).then((frontends) => {
            return frontends[Math.floor(Math.random() * frontends.length)];
        });
    }
    async pickFrontends(force = false) {
        if (!force) {
            const endpoints = await this._getEndpointsFromCache();
            if (typeof endpoints !== "undefined") {
                return endpoints;
            }
        }
        const pickFrontendsRep = await this._request("$pick-frontends");
        if (pickFrontendsRep.code !== 0) {
            throw new Error(`Failed to pick frontends: rep: ${pickFrontendsRep}`);
        }
        await this._setEndpointsToCache(pickFrontendsRep.endpoints);
        return pickFrontendsRep.endpoints;
    }
    async _request(path) {
        let rep;
        let tries = this._endpoints.length;
        while (tries > 0) {
            const url = this._buildUrl(this._nextEndpoint(), path);
            try {
                console.info(`Requesting master: url: ${url}`);
                const response = await Master._fetchWithTimeout(url, {
                    method: "GET",
                    mode: "cors",
                    credentials: "omit",
                    timeout: 5000,
                });
                if (response.status !== 200) {
                    throw new Error(`Failed to request master: status: ${response.status}, desc: ${response.statusText}`);
                }
                rep = await response.json();
                break;
            }
            catch (e) {
                tries--;
                console.error(`Failed to request master: url: ${url}, error: ${e}`);
            }
        }
        if (tries === 0) {
            throw new Error(`Failed to request all endpoints [${this._endpoints}] of master cluster.`);
        }
        if (!rep) {
            throw new Error(`Got an invalid response: ${rep}`);
        }
        console.info("Successfully to request master: rep", rep);
        return rep;
    }
    async _getEndpointsFromCache() {
        const endpointsInfoString = await this._localstore.get(CACHE_KEY);
        if (typeof endpointsInfoString !== "undefined") {
            const endpointsInfo = JSON.parse(endpointsInfoString);
            if (Master._now() - endpointsInfo.ts >= CACHE_TTL) {
                await this._localstore.remove(CACHE_KEY);
            }
            else {
                return endpointsInfo.endpoints;
            }
        }
        return undefined;
    }
    async _setEndpointsToCache(endpoints) {
        await this._localstore.set(CACHE_KEY, JSON.stringify({
            ts: Master._now(),
            endpoints,
        }));
    }
    _nextEndpoint() {
        this._endpoint_index += 1;
        if (this._endpoint_index >= this._endpoints.length) {
            this._endpoint_index = 0;
        }
        return this._endpoints[this._endpoint_index];
    }
    _buildUrl(endpoint, path) {
        if (this._options.sslEnabled) {
            return `https://${endpoint}/${path}`;
        }
        else {
            return `http://${endpoint}/${path}`;
        }
    }
    static async _fetchWithTimeout(resource, options = {}) {
        const { timeout = 5000 } = options;
        const controller = new AbortController();
        const timerId = setTimeout(() => controller.abort(new maxwell_utils_1.TimeoutError()), timeout);
        try {
            return await (0, cross_fetch_1.fetch)(resource, {
                ...options,
                signal: controller.signal,
            });
        }
        finally {
            clearTimeout(timerId);
        }
    }
    static _now() {
        return Math.floor(new Date().getTime() / 1000);
    }
}
exports.Master = Master;
exports.default = Master;
//# sourceMappingURL=master.js.map