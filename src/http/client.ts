import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { buildOptions, Options } from "../internal";
import { Requester, RequestOptions } from "./";

export class Client {
  private _endpoints: string[];
  private _options: Required<Options>;
  private _requester: Requester;

  constructor(endpoints: string[], options?: Options) {
    this._endpoints = endpoints;
    this._options = buildOptions(options);
    this._requester = new Requester(this._endpoints, this._options);
  }

  close(): void {
    this._requester.close();
  }

  get(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.get(path, options);
  }

  delete(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.delete(path, options);
  }

  head(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.head(path, options);
  }

  options(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.options(path, options);
  }

  post(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.post(path, options);
  }

  put(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.put(path, options);
  }

  patch(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.patch(path, options);
  }

  request(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this._requester.request(path, options);
  }
}
