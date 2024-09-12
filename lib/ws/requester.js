"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requester = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const maxwell_utils_1 = require("maxwell-utils");
const _1 = require("./");
class Requester extends _1.Channel {
    constructor(endpoints, options) {
        super(endpoints, options);
        this._connectionPool = new maxwell_utils_1.ConnectionPool(new maxwell_utils_1.MultiAltEndpointsConnectionFactory(super.pickEndpoint.bind(this)), this.options, this);
    }
    close() {
        this._connectionPool.close();
    }
    ws(path, options) {
        return this.request(path, options);
    }
    request(path, options) {
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
        }
        else {
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
    _createReqReq(path, payload, headers) {
        return new maxwell_protocol_1.msg_types.req_req_t({
            path,
            payload: JSON.stringify(payload ? payload : {}),
            header: headers ? headers : {},
        });
    }
}
exports.Requester = Requester;
//# sourceMappingURL=requester.js.map