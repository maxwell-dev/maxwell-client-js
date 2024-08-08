import { fetch } from "cross-fetch";
import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";
import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Localstore } from "@xuchaoqian/localstore";
import { TimeoutError } from "maxwell-utils";
import { Options } from "./internal";

const CACHE_KEY = "maxwell-client.frontend-endpoints";
const CACHE_TTL = 60 * 60 * 24;

export class Master {
  private _endpoints: string[];
  private _options: Options;
  private _endpoint_index: number;
  private _localstore?: Localstore;

  constructor(endpoints: string[], options: Options) {
    this._endpoints = endpoints;
    this._options = options;
    this._endpoint_index = -1;
    if (this._options.localStoreEnabled) {
      this._localstore = new Localstore();
    }
  }

  pickFrontend(force = false): AbortablePromise<string> {
    return AbortablePromise.from(this.pickFrontends(force)).then(
      (frontends) => {
        return frontends[Math.floor(Math.random() * frontends.length)];
      }
    );
  }

  async pickFrontends(force = false): Promise<string> {
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

  private async _request(path: string): Promise<any> {
    let rep: any;
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
          throw new Error(
            `Failed to request master: status: ${response.status}, desc: ${response.statusText}`
          );
        }
        rep = await response.json();
        break;
      } catch (reason: any) {
        tries--;
        console.error(
          `Failed to request master: url: ${url}, reason: ${reason.message}`
        );
      }
    }
    if (tries === 0) {
      throw new Error(
        `Failed to request all endpoints(${this._endpoints}) of master cluster.`
      );
    }
    if (!rep) {
      throw new Error(`Got an invalid response: ${rep}`);
    }
    console.info("Successfully to request master: rep", rep);
    return rep;
  }

  private async _getEndpointsFromCache() {
    if (!this._options.localStoreEnabled) {
      return undefined;
    }
    const endpointsInfoString = await this._localstore?.get(CACHE_KEY);
    if (typeof endpointsInfoString !== "undefined") {
      const endpointsInfo = JSON.parse(endpointsInfoString);
      if (Master._now() - endpointsInfo.ts >= CACHE_TTL) {
        await this._localstore?.remove(CACHE_KEY);
      } else {
        return endpointsInfo.endpoints;
      }
    }
    return undefined;
  }

  private async _setEndpointsToCache(endpoints: string[]) {
    if (!this._options.localStoreEnabled) {
      return undefined;
    }
    await this._localstore?.set(
      CACHE_KEY,
      JSON.stringify({
        ts: Master._now(),
        endpoints,
      })
    );
  }

  private _nextEndpoint() {
    this._endpoint_index += 1;
    if (this._endpoint_index >= this._endpoints.length) {
      this._endpoint_index = 0;
    }
    return this._endpoints[this._endpoint_index];
  }

  private _buildUrl(endpoint: string, path: string) {
    if (this._options.sslEnabled) {
      return `https://${endpoint}/${path}`;
    } else {
      return `http://${endpoint}/${path}`;
    }
  }

  private static async _fetchWithTimeout(resource: any, options: any = {}) {
    const { timeout = 5000 } = options;

    const controller = new AbortController();
    const timerId = setTimeout(
      () => controller.abort(new TimeoutError()),
      timeout
    );
    try {
      return await fetch(resource, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timerId);
    }
  }

  private static _now() {
    return Math.floor(new Date().getTime() / 1000);
  }
}

export default Master;
