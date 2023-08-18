"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = void 0;
const axios_1 = __importDefault(require("axios"));
const CACHE_KEY = "maxwell-client.frontend-endpoints";
const CACHE_TTL = 60 * 60 * 24;
class Master {
    constructor(endpoints, options) {
        this._endpoints = endpoints;
        this._options = options;
        this._endpoint_index = -1;
    }
    async assignFrontend(force = false) {
        if (typeof localStorage === "undefined" || localStorage === null) {
            const assignFrontendRep = await this._request("$assign-frontend");
            if (assignFrontendRep.code !== 0) {
                throw new Error(`Failed to assign frontend: ${assignFrontendRep}`);
            }
            return assignFrontendRep.endpoint;
        }
        else {
            const frontends = await this.getFrontends(force);
            return frontends[Math.floor(Math.random() * frontends.length)];
        }
    }
    async getFrontends(force = false) {
        if (!force) {
            const endpointsInfoString = localStorage.getItem(CACHE_KEY);
            if (endpointsInfoString !== null) {
                const endpointsInfo = JSON.parse(endpointsInfoString);
                if (Master._now() - endpointsInfo.ts >= CACHE_TTL) {
                    localStorage.removeItem(CACHE_KEY);
                }
                else {
                    return endpointsInfo.endpoints;
                }
            }
        }
        const getFrontendsRep = await this._request("$get-frontends");
        if (getFrontendsRep.code !== 0) {
            throw new Error(`Failed to get frontends: ${getFrontendsRep}`);
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            ts: Master._now(),
            endpoints: getFrontendsRep.endpoints,
        }));
        return getFrontendsRep.endpoints;
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
                    throw new Error(`Failed to assign frontend: code: ${response.status}, desc: ${response.statusText}`);
                }
                rep = response.data;
                break;
            }
            catch (e) {
                tries--;
                console.error(`Failed to assign frontend: url: ${url}, error: ${e}`);
            }
        }
        if (tries === 0 || typeof rep === "undefined") {
            throw new Error(`Failed to assign frontend: all endpoints failed`);
        }
        console.info(`Successfully requested:`, rep);
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