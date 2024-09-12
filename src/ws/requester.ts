import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { msg_types } from "maxwell-protocol";
import {
  ConnectionPool,
  MultiAltEndpointsConnection,
  MultiAltEndpointsConnectionFactory,
} from "maxwell-utils";
import { Options } from "../internal";
import { Channel } from "./";

export type Headers = {
  sourceEnabled?: boolean;
  agent?: string | null;
  endpoint?: string | null;
};

export type Payload = any;

export interface RequestOptions {
  // `headers` are Headers object to be sent with the request.
  headers?: Headers;

  // Only support plain object payload, it will be converted to a JSON string
  payload?: Payload;

  // `waitOpenTimeout` specifies the number of milliseconds before the connection times out.
  // If the connection takes longer than `waitOpenTimeout`, the connection will be aborted.
  // Default is `this.options.waitOpenTimeout`
  waitOpenTimeout?: number;

  // `roundTimeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `roundTimeout`, the request will be aborted.
  // Default is `this.options.roundTimeout`
  roundTimeout?: number;

  // An AbortSignal. If this option is set, the request can be canceled
  // by calling abort() on the corresponding AbortController.
  signal?: AbortSignal;
}

export class Requester extends Channel {
  private readonly _connectionPool: ConnectionPool<MultiAltEndpointsConnection>;

  //===========================================
  // APIs
  //===========================================

  constructor(endpoints: string[], options: Required<Options>) {
    super(endpoints, options);
    this._connectionPool = new ConnectionPool(
      new MultiAltEndpointsConnectionFactory(super.pickEndpoint.bind(this)),
      this.options,
      this,
    );
  }

  close(): void {
    this._connectionPool.close();
  }

  ws(path: string, options?: RequestOptions): AbortablePromise<any> {
    return this.request(path, options);
  }

  request(path: string, options?: RequestOptions): AbortablePromise<any> {
    if (typeof options === "undefined") {
      options = {};
    }
    let { payload, headers, roundTimeout, signal } = options;
    if (typeof roundTimeout === "undefined") {
      roundTimeout = this.options.roundTimeout;
    }
    const connection = this._connectionPool.getConnection();
    if (connection.isOpen()) {
      return connection
        .request(this._createReqReq(path, payload, headers), {
          timeout: roundTimeout,
          signal,
        })
        .then((result) => {
          return JSON.parse(result.payload);
        });
    } else {
      let { waitOpenTimeout } = options;
      if (typeof waitOpenTimeout === "undefined") {
        waitOpenTimeout = this.options.waitOpenTimeout;
      }
      return connection
        .waitOpen({ timeout: waitOpenTimeout, signal })
        .then((connection) => {
          return connection
            .request(this._createReqReq(path, payload, headers), {
              timeout: roundTimeout,
              signal,
            })
            .then((result) => {
              return JSON.parse(result.payload);
            });
        });
    }
  }

  //===========================================
  // internal functions
  //===========================================

  private _createReqReq(
    path: string,
    payload?: unknown,
    headers?: Headers,
  ): typeof msg_types.req_req_t.prototype {
    return new msg_types.req_req_t({
      path,
      payload: JSON.stringify(payload ? payload : {}),
      header: headers ? headers : {},
    });
  }
}
