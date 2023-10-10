"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = void 0;
const axios_1 = __importDefault(require("axios"));
const localstore_1 = require("@xuchaoqian/localstore");
const CACHE_KEY = "maxwell-client.frontend-endpoints";
const CACHE_TTL = 60 * 60 * 24;
class Master {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = options;
        this._endpoint_index = -1;
        this._localstore = new localstore_1.Localstore();
    }
    async pickFrontend(force = false) {
        const frontends = await this.pickFrontends(force);
        return frontends[Math.floor(Math.random() * frontends.length)];
    }
    async pickFrontends(force = false) {
        if (!force) {
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
        }
        const pickFrontendsRep = await this._request("$pick-frontends");
        if (pickFrontendsRep.code !== 0) {
            throw new Error(`Failed to pick frontends: ${pickFrontendsRep}`);
        }
        await this._localstore.set(CACHE_KEY, JSON.stringify({
            ts: Master._now(),
            endpoints: pickFrontendsRep.endpoints,
        }));
        return pickFrontendsRep.endpoints;
    }
    async _request(path) {
        let rep;
        let tries = this._endpoints.length;
        while (tries > 0) {
            const url = this._buildUrl(this._nextEndpoint(), path);
            try {
                console.info(`Requesting master: url: ${url}`);
                const response = await axios_1.default.get(url, { timeout: 5000 });
                if (response.status !== 200) {
                    throw new Error(`Failed to request master: status: ${response.status}, desc: ${response.statusText}`);
                }
                rep = response.data;
                break;
            }
            catch (e) {
                tries--;
                console.error(`Failed to request master: url: ${url}, error: ${e}`);
            }
        }
        if (tries === 0) {
            throw new Error(`Failed to request all endpoints: ${this._endpoints} of master cluster.`);
        }
        if (!rep) {
            throw new Error(`Got an invalid response: ${rep}`);
        }
        console.info("Successfully to request master: rep", rep);
        return rep;
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
    static _now() {
        return Math.floor(new Date().getTime() / 1000);
    }
}
exports.Master = Master;
exports.default = Master;
//# sourceMappingURL=master.js.map