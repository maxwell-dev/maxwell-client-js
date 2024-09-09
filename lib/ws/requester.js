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
    ws(path, payload, headers, roundTimeout) {
        return this.request(path, payload, headers, roundTimeout);
    }
    request(path, payload, headers, roundTimeout) {
        const connection = this._connectionPool.getConnection();
        if (connection.isOpen()) {
            return connection
                .request(this._createReqReq(path, payload, headers), {
                timeout: roundTimeout,
            })
                .then((result) => {
                return JSON.parse(result.payload);
            });
        }
        else {
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