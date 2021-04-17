"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const Code_1 = __importDefault(require("./Code"));
const Event_1 = __importDefault(require("./Event"));
const Listenable_1 = __importDefault(require("./Listenable"));
const PromisePlus_1 = __importDefault(require("./PromisePlus"));
const Condition_1 = __importDefault(require("./Condition"));
const WebSocketImpl = typeof WebSocket !== "undefined" ? WebSocket : require("ws");
class Connection extends Listenable_1.default {
    constructor(endpoint, options) {
        super();
        this._endpoint = endpoint;
        this._options = options;
        this._shouldRun = true;
        this._heartbeatTimer = null;
        this._reconnectTimer = null;
        this._sentAt = 0;
        this._lastRef = 0;
        this._attachments = new Map();
        this._condition = new Condition_1.default(() => {
            return this.isOpen();
        });
        this._websocket = null;
        this._connect();
    }
    close() {
        this._shouldRun = false;
        this._condition.clear();
        this._stopReconnect();
        this._disconnect();
        this._attachments.clear();
    }
    isOpen() {
        return this._websocket !== null && this._websocket.readyState === 1;
    }
    waitUntilOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._condition.wait();
        });
    }
    getEndpoint() {
        return this._endpoint;
    }
    request(msg, timeout) {
        const ref = this._newRef();
        if (msg.constructor === maxwell_protocol_1.msg_types.do_req_t) {
            msg.traces[0].ref = ref;
        }
        else {
            msg.ref = ref;
        }
        if (typeof timeout === "undefined") {
            timeout = this._options.defaultRoundTimeout;
        }
        const pp = new PromisePlus_1.default((resolve, reject) => {
            this._attachments.set(ref, [resolve, reject, msg, 0, null]);
        }, timeout, msg).catch((reason) => {
            this._deleteAttachment(ref);
            throw reason;
        });
        this.send(msg);
        return pp.then((result) => result);
    }
    send(msg) {
        if (this._options.debugRoundEnabled) {
            const limitedMsg = JSON.stringify(msg).substr(0, 100);
            console.debug(`Sending msg: [${msg.constructor.name}]${limitedMsg}`);
        }
        let encodedMsg;
        try {
            encodedMsg = maxwell_protocol_1.encode_msg(msg);
        }
        catch (e) {
            console.error(`Failed to encode msg: reason: ${e.stack}`);
            this.notify(Event_1.default.ON_ERROR, Code_1.default.FAILED_TO_ENCODE);
            return;
        }
        if (this._websocket == null) {
            console.error(`Failed to send msg: reason: connection lost`);
            this.notify(Event_1.default.ON_ERROR, Code_1.default.FAILED_TO_SEND);
            return;
        }
        try {
            this._websocket.send(encodedMsg);
            this._sentAt = this._now();
        }
        catch (e) {
            console.error(`Failed to send msg: reason: ${e.stack}`);
            this.notify(Event_1.default.ON_ERROR, Code_1.default.FAILED_TO_SEND);
        }
    }
    _onOpen() {
        this._repeatSendHeartbeat();
        console.log(`Connection connected: endpoint: ${this._endpoint}`);
        this._condition.notify();
        this.notify(Event_1.default.ON_CONNECTED);
    }
    _onClose() {
        this._stopSendHeartbeat();
        if (this._shouldRun) {
            this._reconnect();
        }
        console.log(`Connection disconnected: endpoint: ${this._endpoint}`);
        this.notify(Event_1.default.ON_DISCONNECTED);
    }
    _onMsg(event) {
        let msg;
        try {
            msg = maxwell_protocol_1.decode_msg(event.data);
        }
        catch (e) {
            console.error(`Failed to decode msg: reason: ${e.stack}`);
            this.notify(Event_1.default.ON_ERROR, Code_1.default.FAILED_TO_DECODE);
            return;
        }
        const msgType = msg.constructor;
        if (msgType === maxwell_protocol_1.msg_types.ping_rep_t) {
        }
        else {
            if (this._options.debugRoundEnabled) {
                console.debug(`Received msg: [${msgType.name}]` +
                    `${JSON.stringify(msg).substr(0, 100)}`);
            }
            if (msgType === maxwell_protocol_1.msg_types.do_req_t) {
                this.notify(Event_1.default.ON_MESSAGE, msg);
                return;
            }
            let ref;
            if (msgType === maxwell_protocol_1.msg_types.do_rep_t ||
                msgType === maxwell_protocol_1.msg_types.ok2_rep_t ||
                msgType === maxwell_protocol_1.msg_types.error2_rep_t) {
                ref = msg.traces[0].ref;
            }
            else {
                ref = msg.ref;
            }
            const attachment = this._attachments.get(ref);
            if (typeof attachment === "undefined") {
                return;
            }
            if (msgType === maxwell_protocol_1.msg_types.error_rep_t ||
                msgType === maxwell_protocol_1.msg_types.error2_rep_t) {
                if (this._options.retryRouteCount > 0 &&
                    (msg.desc.includes("failed_to_find_watcher") ||
                        msg.desc.includes("frontend_not_found")) &&
                    attachment[3] < this._options.retryRouteCount) {
                    attachment[4] = setTimeout(() => {
                        this.send(attachment[2]);
                    }, 500 * ++attachment[3]);
                }
                else {
                    try {
                        attachment[1](new Error(`code: ${msg.code}, desc: ${msg.desc}`));
                    }
                    finally {
                        this._deleteAttachment(ref);
                    }
                }
            }
            else {
                try {
                    attachment[0](msg);
                }
                finally {
                    this._deleteAttachment(ref);
                }
            }
        }
    }
    _onError() {
        console.error(`Failed to connect: endpoint: ${this._endpoint}`);
        this.notify(Event_1.default.ON_ERROR, Code_1.default.FAILED_TO_CONNECT);
    }
    _connect() {
        console.log(`Connecting: endpoint: ${this._endpoint}`);
        this.notify(Event_1.default.ON_CONNECTING);
        const websocket = new WebSocketImpl(this._buildUrl());
        websocket.binaryType = "arraybuffer";
        websocket.onopen = this._onOpen.bind(this);
        websocket.onclose = this._onClose.bind(this);
        websocket.onmessage = this._onMsg.bind(this);
        websocket.onerror = this._onError.bind(this);
        this._websocket = websocket;
    }
    _disconnect() {
        console.log(`Disconnecting: endpoint: ${this._endpoint}`);
        this.notify(Event_1.default.ON_DISCONNECTING);
        if (this._websocket !== null) {
            this._websocket.close();
            this._websocket = null;
        }
    }
    _reconnect() {
        this._reconnectTimer = setTimeout(this._connect.bind(this), this._options.reconnectDelay);
    }
    _stopReconnect() {
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }
    _repeatSendHeartbeat() {
        this._heartbeatTimer = setInterval(this._sendHeartbeat.bind(this), this._options.heartbeatInterval);
    }
    _stopSendHeartbeat() {
        if (this._heartbeatTimer !== null) {
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }
    }
    _sendHeartbeat() {
        if (this.isOpen() && !this._hasSentHeartbeat()) {
            this.send(this._createPingReq());
        }
    }
    _hasSentHeartbeat() {
        return this._now() - this._sentAt < this._options.heartbeatInterval;
    }
    _createPingReq() {
        return new maxwell_protocol_1.msg_types.ping_req_t({});
    }
    _newRef() {
        if (this._lastRef > 100000000) {
            this._lastRef = 1;
        }
        return ++this._lastRef;
    }
    _now() {
        return new Date().getTime();
    }
    _buildUrl() {
        if (this._options.sslEnabled) {
            return `wss://${this._endpoint}`;
        }
        else {
            return `ws://${this._endpoint}`;
        }
    }
    _deleteAttachment(ref) {
        const attachments = this._attachments.get(ref);
        if (typeof attachments === "undefined") {
            return;
        }
        if (attachments[4] !== null) {
            clearTimeout(attachments[4]);
        }
        this._attachments.delete(ref);
    }
}
exports.Connection = Connection;
exports.default = Connection;
//# sourceMappingURL=Connection.js.map