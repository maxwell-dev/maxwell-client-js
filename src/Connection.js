const protocol = require("maxwell-protocol");
const Code = require("./Code");
const Event = require("./Event");
const Listenable = require("./Listenable");
const PromisePlus = require("./PromisePlus");
const WebSocketImpl =
  typeof WebSocket !== "undefined" ? WebSocket : require("ws");

class Connection extends Listenable {
  //===========================================
  // APIs
  //===========================================

  constructor(endpoint, options) {
    super();

    this._endpoint = endpoint;
    this._options = options;

    this._shouldRun = true;
    this._heartbeatTimer = null;
    this._reconnectTimer = null;
    this._lastSendingTime = 0;
    this._lastRef = 0;
    this._attachments = new Map(); // { N:[resolve, reject, msg, retryRouteCount, timer]...}
    this._websocket = null;
    this._connect();
  }

  close() {
    this._shouldRun = false;
    this._stopReconnect();
    this._disconnect();
    this._attachments.clear();
  }

  isOpen() {
    return this._websocket !== null && this._websocket.readyState === 1;
  }

  getEndpoint() {
    return this._endpoint;
  }

  request(msg, timeout) {
    let ref = this._newRef();

    if (msg.__proto__.$type === protocol.do_req_t) {
      msg.traces[0].ref = ref;
    } else {
      msg.ref = ref;
    }

    if (typeof timeout === "undefined") {
      timeout = this._options.defaultRoundTimeout;
    }

    let pp = new PromisePlus(
      (resolve, reject) => {
        this._attachments.set(ref, [resolve, reject, msg, 0, null]);
      },
      [timeout, msg]
    ).catch((reason) => {
      this._deleteAttachment(ref);
      throw reason;
    });

    // let limitedMsg = JSON.stringify(msg).substr(0, 100);
    // console.debug(`Sending msg: [${msg.__proto__.$type}]${limitedMsg}`);

    this.send(msg);

    return pp.then((result) => result);
  }

  send(msg) {
    let encodedMsg = "";
    try {
      encodedMsg = protocol.encode_msg(msg);
    } catch (e) {
      console.error(`Failed to encode msg: reason: ${e.stack}`);
      this.notify(Event.ON_ERROR, Code.FAILED_TO_ENCODE);
      return;
    }

    try {
      this._websocket.send(encodedMsg);
      this._lastSendingTime = this._now();
    } catch (e) {
      console.error(`Failed to send msg: reason: ${e.stack}`);
      this.notify(Event.ON_ERROR, Code.FAILED_TO_SEND);
    }
  }

  //===========================================
  // websocket callbacks
  //===========================================
  _onOpen() {
    this._repeatSendHeartbeat();
    console.log(`Connection connected: endpoint: ${this._endpoint}`);
    this.notify(Event.ON_CONNECTED);
  }

  _onClose() {
    this._stopSendHeartbeat();
    if (this._shouldRun) {
      this._reconnect();
    }
    console.log(`Connection disconnected: endpoint: ${this._endpoint}`);
    this.notify(Event.ON_DISCONNECTED);
  }

  _onMsg(event) {
    let msg = "";

    try {
      msg = protocol.decode_msg(event.data);
    } catch (e) {
      console.error(`Failed to decode msg: reason: ${e.stack}`);
      this.notify(Event.ON_ERROR, Code.FAILED_TO_DECODE);
      return;
    }

    let msgType = msg.__proto__.$type;

    if (msgType === protocol.ping_rep_t) {
      // do nothing
    } else {
      if (msgType === protocol.do_req_t) {
        this.notify(Event.ON_MESSAGE, msg);
        return;
      }

      let ref;
      if (
        msgType === protocol.do_rep_t ||
        msgType === protocol.ok2_rep_t ||
        msgType === protocol.error2_rep_t
      ) {
        ref = msg.traces[0].ref;
      } else {
        ref = msg.ref;
      }

      // console.debug(
      //   `Received msg: [${msg.__proto__.$type}]` +
      //     `${JSON.stringify(msg).substr(0, 100)}`
      // );

      let attachment = this._attachments.get(ref);
      if (typeof attachment === "undefined") {
        return;
      }

      if (
        msgType === protocol.error_rep_t ||
        msgType === protocol.error2_rep_t
      ) {
        if (
          this._options.retryRouteCount > 0 &&
          (msg.desc.includes("failed_to_find_watcher") ||
            msg.desc.includes("frontend_not_found")) &&
          attachment[3] < this._options.retryRouteCount
        ) {
          attachment[4] = setTimeout(() => {
            this.send(attachment[2]);
          }, 500 * ++attachment[3]);
        } else {
          try {
            attachment[1](new Error(`code: ${msg.code}, desc: ${msg.desc}`));
          } finally {
            this._deleteAttachment(ref);
          }
        }
      } else {
        try {
          attachment[0](msg);
        } finally {
          this._deleteAttachment(ref);
        }
      }
    }
  }

  _onError() {
    console.error(`Failed to connect: endpoint: ${this._endpoint}`);
    this.notify(Event.ON_ERROR, Code.FAILED_TO_CONNECT);
  }

  //===========================================
  // internal functions
  //===========================================
  _connect() {
    console.log(`Connecting: endpoint: ${this._endpoint}`);
    this.notify(Event.ON_CONNECTING);
    let websocket = new WebSocketImpl(this._buildUrl());
    websocket.binaryType = "arraybuffer";
    websocket.onopen = this._onOpen.bind(this);
    websocket.onclose = this._onClose.bind(this);
    websocket.onmessage = this._onMsg.bind(this);
    websocket.onerror = this._onError.bind(this);
    this._websocket = websocket;
  }

  _disconnect() {
    console.log(`Disconnecting: endpoint: ${this._endpoint}`);
    this.notify(Event.ON_DISCONNECTING);
    if (this._websocket !== null) {
      this._websocket.close();
      this._websocket = null;
    }
  }

  _reconnect() {
    this._reconnectTimer = setTimeout(
      this._connect.bind(this),
      this._options.reconnectDelay
    );
  }

  _stopReconnect() {
    if (this._reconnectTimer !== null) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  _repeatSendHeartbeat() {
    this._heartbeatTimer = setInterval(
      this._sendHeartbeat.bind(this),
      this._options.heartbeatInterval
    );
  }

  _stopSendHeartbeat() {
    if (this._heartbeatTimer !== null) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  _sendHeartbeat() {
    if (this.isOpen() && !this._hasSentHeartbeat()) {
      this.send(this._createPingReq(), 1);
    }
  }

  _hasSentHeartbeat() {
    return (
      this._now() - this._lastSendingTime < this._options.heartbeatInterval
    );
  }

  _createPingReq() {
    return protocol.ping_req_t.create({});
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
    } else {
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

module.exports = Connection;
