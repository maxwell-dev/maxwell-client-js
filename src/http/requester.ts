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

export type ResponseViewType =
  | "json"
  | "text"
  | "arraybuffer"
  | "blob"
  | "bytes"
  | "formData"
  | "stream"
  | "response"; // just return the response object

export interface RequestOptions {
  // `method` is the request method to be used when making the request.
  // Default is "GET"
  method?: Method;

  // `headers` are custom headers to be sent with the request.
  headers?: Headers;

  // `params` are the URL parameters to be sent with the request.
  // Must be a plain object or a URLSearchParams object
  params?: Params;

  // Only applicable for request methods 'PUT', 'POST', 'DELETE', and 'PATCH'.
  // If the body is a plain object, it will be converted to a JSON string,
  // otherwise, the body will be sent as is.
  body?: Body;

  // `responseViewType` specifies the type of the response.
  // If not specified, the response view type will be detected by the following rules:
  // - if the body is null, just return `response`,
  // - otherwise, the response view type will be detected by the content type:
  //   - "json" for application/json
  //   - "text" for text/xxx
  //   - "arraybuffer" for application/octet-stream
  //   - "blob" for application/vnd.xxx, image/xxx, and font/xxx
  //   - "formData" for multipart/form-data
  //   - "stream" for audio/xxx and video/xxx
  //   - "response" for other cases
  responseViewType?: ResponseViewType;

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  // Default is undefined (no timeout)
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
      options = { method: "GET" };
    }
    const fetchOptions = this._buildFetchOptions(options);
    return new AbortablePromise((resolve, reject) => {
      this._buildURL(path, options?.params)
        .then((url) => {
          return fetch(url, fetchOptions).then((response) => {
            if (response.ok) {
              resolve(
                Requester._determineResponseView(
                  response,
                  options.responseViewType,
                ),
              );
            } else {
              reject(
                new Error(
                  `FetchError: Failed to ${fetchOptions.method?.toLowerCase()} ${url.toString()}, reason: ${response.status} (${response.statusText})`,
                ),
              );
            }
          });
        })
        .catch(reject);
    }, fetchOptions.signal);
  }

  private _buildFetchOptions(
    options: RequestOptions,
  ): RequestInit & { signal: AbortSignal } {
    const fetchOptions: RequestInit = {
      method: options.method ?? "GET",
      mode: "cors",
      credentials: "omit",
    };
    if (options.headers) {
      fetchOptions.headers = options.headers;
    }
    if (options.body) {
      if (Requester._isPlainObject(options.body)) {
        fetchOptions.body = JSON.stringify(options.body);
      } else {
        fetchOptions.body = options.body;
      }
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
    return fetchOptions as RequestInit & { signal: AbortSignal };
  }

  private static _isPlainObject(value: any): boolean {
    return value?.constructor === Object;
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

  private static _determineResponseView(
    response: Response,
    inputResponseViewType?: ResponseViewType,
  ): Promise<any> | ReadableStream<Uint8Array> | null | Response {
    const responseViewType =
      inputResponseViewType ?? Requester._parseResponseViewType(response);

    switch (responseViewType) {
      case "json":
        return response.json();
      case "text":
        return response.text();
      case "arraybuffer":
        return response.arrayBuffer();
      case "blob":
        return response.blob();
      case "formData":
        return response.formData();
      case "stream":
        return response.body;
      default:
        return response;
    }
  }

  private static _parseResponseViewType(response: Response): ResponseViewType {
    if (response.body === null) {
      return "response";
    }
    let contentType = response.headers.get("content-type");
    if (!contentType) {
      return "response";
    }
    contentType = contentType.toLowerCase();
    if (contentType.startsWith("application/json")) {
      return "json";
    } else if (contentType.startsWith("text/")) {
      return "text";
    } else if (contentType.startsWith("application/octet-stream")) {
      return "arraybuffer";
    } else if (
      contentType.startsWith("application/vnd") ||
      contentType.startsWith("image/") ||
      contentType.startsWith("font/")
    ) {
      return "blob";
    } else if (
      contentType.startsWith("audio/") ||
      contentType.startsWith("video/")
    ) {
      return "stream";
    } else if (contentType.startsWith("multipart/form-data")) {
      return "formData";
    } else {
      return "response";
    }
  }
}
