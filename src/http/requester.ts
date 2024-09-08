import {
  AbortControllerPlus,
  AbortSignalPlus,
  AbortablePromise,
} from "@xuchaoqian/abortable-promise";
import { createEndpointPicker, EndpointPicker, Options } from "../internal";

export type Method =
  | "GET"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "POST"
  | "PUT"
  | "PATCH";

export type Headers = { [key: string]: any };

export type Params = { [key: string]: any } | URLSearchParams;

export type Body = any;

export interface RequestOptions {
  // `method` is the request method to be used when making the request.
  // default is "GET"
  method?: Method;

  // `headers` are custom headers to be sent
  headers?: Headers;

  // `params` are the URL parameters to be sent with the request
  // Must be a plain object or a URLSearchParams object
  params?: Params;

  // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
  body?: Body;

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  // default is `0` (no timeout)
  timeout?: number;

  // An AbortSignal. If this option is set, the request can be canceled
  // by calling abort() on the corresponding AbortController.
  signal?: AbortSignal;
}

export class Requester {
  private _options: Required<Options>;
  private _endpointPicker: EndpointPicker;

  constructor(endpoints: string[], options: Required<Options>) {
    this._options = options;
    this._endpointPicker = createEndpointPicker(endpoints, options);
  }

  close(): void {}

  get(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "GET" };
    } else {
      options.method = "GET";
    }
    return this.request(path, options);
  }

  delete(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "DELETE" };
    } else {
      options.method = "DELETE";
    }
    return this.request(path, options);
  }

  head(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "HEAD" };
    } else {
      options.method = "HEAD";
    }
    return this.request(path, options);
  }

  options(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "OPTIONS" };
    } else {
      options.method = "OPTIONS";
    }
    return this.request(path, options);
  }

  post(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "POST" };
    } else {
      options.method = "POST";
    }
    return this.request(path, options);
  }

  put(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "PUT" };
    } else {
      options.method = "PUT";
    }
    return this.request(path, options);
  }

  patch(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = { method: "PATCH" };
    } else {
      options.method = "PATCH";
    }
    return this.request(path, options);
  }

  request(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = {};
    }
    const fetchOptions: RequestInit = {
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
        if (!(signal instanceof AbortSignalPlus)) {
          signal = AbortSignalPlus.from(signal);
        }
        (signal as AbortSignalPlus).timeout(options.timeout);
      }
      fetchOptions.signal = signal;
    } else {
      const controller = new AbortControllerPlus();
      const signal = controller.signal;
      if (options.timeout) {
        signal.timeout(options.timeout);
      }
      fetchOptions.signal = signal;
    }

    return new AbortablePromise((resolve, reject) => {
      this._buildURL(path, options?.params)
        .then((url) => fetch(url, fetchOptions))
        .then(resolve)
        .catch(reject);
    }, fetchOptions.signal);
  }

  private async _buildURL(path: string, params?: Params): Promise<URL> {
    const scheme = this._options.sslEnabled ? "https://" : "http://";
    const host = await this._endpointPicker.pick();
    const baseURL = `${scheme}${host}`;
    const url = new URL(path, baseURL);

    // Add search params
    if (params) {
      if (params instanceof URLSearchParams) {
        url.search = params.toString();
      } else {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
    }

    return url;
  }
}
