import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { msg_types } from "maxwell-protocol";
import {
  ConnectionPool,
  MultiAltEndpointsConnection,
  MultiAltEndpointsConnectionFactory,
} from "maxwell-utils";
import { Options } from "../internal";
import { Channel, Headers } from "./";

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

  ws(
    path: string,
    payload?: unknown,
    headers?: Headers,
    roundTimeout?: number,
  ): AbortablePromise<any> {
    return this.request(path, payload, headers, roundTimeout);
  }

  request(
    path: string,
    payload?: unknown,
    headers?: Headers,
    roundTimeout?: number,
  ): AbortablePromise<any> {
    const connection = this._connectionPool.getConnection();
    if (connection.isOpen()) {
      return connection
        .request(this._createReqReq(path, payload, headers), {
          timeout: roundTimeout,
        })
        .then((result) => {
          return JSON.parse(result.payload);
        });
    } else {
      return connection
        .waitOpen({ timeout: this.options.waitOpenTimeout })
        .then((connection) => {
          return connection
            .request(this._createReqReq(path, payload, headers), {
              timeout: roundTimeout,
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
