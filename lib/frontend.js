"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frontend = void 0;
const abortable_promise_1 = require("@xuchaoqian/abortable-promise");
const maxwell_protocol_1 = require("maxwell-protocol");
const maxwell_utils_1 = require("maxwell-utils");
const internal_1 = require("./internal");
class Frontend extends maxwell_utils_1.Listenable {
    constructor(master, options) {
        super();
        this._master = master;
        this._options = options;
        this._subscriptionManager = new internal_1.SubscriptionManager();
        this._onMsgs = new Map();
        this._queueManager = new internal_1.QueueManager(this._options.queueCapacity || 1024);
        this._pullTasks = new Map();
        this._connection = new maxwell_utils_1.MultiAltEndpointsConnection(this._pickEndpoint.bind(this), this._options, this);
        this._failedToConnect = false;
    }
    close() {
        this._deleteAllPullTasks();
        this._subscriptionManager.clear();
        this._onMsgs.clear();
        this._queueManager.clear();
        this._connection.close();
    }
    subscribe(topic, offset, onMsg) {
        if (this._subscriptionManager.has(topic)) {
            console.info(`Already subscribed: topic: ${topic}`);
            return;
        }
        this._subscriptionManager.addSubscription(topic, offset);
        this._onMsgs.set(topic, onMsg);
        this._queueManager.get_or_set(topic);
        if (this._connection.isOpen()) {
            this._newPullTask(topic, offset);
        }
    }
    unsubscribe(topic) {
        this._deletePullTask(topic);
        this._subscriptionManager.deleteSubscription(topic);
        this._onMsgs.delete(topic);
        this._queueManager.delete(topic);
    }
    get(topic, offset, limit) {
        if (typeof offset === "undefined") {
            offset = (0, internal_1.asOffset)(0);
        }
        if (typeof limit === "undefined") {
            limit = 8;
        }
        return this._queueManager.get_or_set(topic).getFrom(offset, limit);
    }
    commit(topic, offset) {
        if (typeof offset === "undefined") {
            this._queueManager.get_or_set(topic).deleteFirst();
        }
        else {
            this._queueManager.get_or_set(topic).deleteTo(offset);
        }
    }
    receive(topic, offset, limit) {
        const msgs = this.get(topic, offset, limit);
        const count = msgs.length;
        if (count > 0) {
            this.commit(topic, msgs[count - 1].offset);
        }
        return msgs;
    }
    request(path, payload, headers) {
        return this._connection
            .waitOpen(this._options.waitOpenTimeout)
            .then((connection) => {
            return connection
                .request(this._createReqReq(path, payload, headers), this._options.roundTimeout)
                .then((result) => {
                return JSON.parse(result.payload);
            });
        });
    }
    onConnecting(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_CONNECTING, connection, ...rest);
    }
    onConnected(connection, ...rest) {
        this._failedToConnect = false;
        this._renewAllTask();
        this.notify(maxwell_utils_1.Event.ON_CONNECTED, connection, ...rest);
    }
    onDisconnecting(connection, ...rest) {
        this.notify(maxwell_utils_1.Event.ON_DISCONNECTING, connection, ...rest);
    }
    onDisconnected(connection, ...rest) {
        this._deleteAllPullTasks();
        this.notify(maxwell_utils_1.Event.ON_DISCONNECTED, connection, ...rest);
    }
    onCorrupted(connection, ...rest) {
        this._failedToConnect = true;
        this.notify(maxwell_utils_1.Event.ON_CORRUPTED, connection, ...rest);
    }
    _pickEndpoint() {
        return this._master.pickFrontend(this._failedToConnect);
    }
    _renewAllTask() {
        this._subscriptionManager.toPendings();
        for (const pending of this._subscriptionManager.getAllPendings()) {
            this._newPullTask(pending[0], pending[1]);
        }
    }
    _newPullTask(topic, offset) {
        if (!this._isValidSubscription(topic)) {
            console.debug(`Already unsubscribed: ${topic}`);
            return;
        }
        this._deletePullTask(topic);
        const queue = this._queueManager.get_or_set(topic);
        if (queue.isFull()) {
            console.warn(`Queue(${topic}) is full(${queue.size()}), waiting for consuming...`);
            setTimeout(() => this._newPullTask(topic, offset), 1000);
            this._onMsgs.get(topic)(queue.lastOffset());
            return;
        }
        const pullTask = this._connection
            .request(this._createPullReq(topic, offset), this._options.roundTimeout)
            .then((value) => {
            if (!this._isValidSubscription(topic)) {
                console.debug(`Already unsubscribed: ${topic}`);
                return;
            }
            if (value.msgs.length < 1) {
                console.info(`No msgs pulled: topic: ${topic}, offset: ${offset}`);
                setTimeout(() => this._newPullTask(topic, offset), this._options.pullInterval);
                return;
            }
            queue.put(value.msgs);
            const lastOffset = queue.lastOffset();
            const nextOffset = lastOffset + (0, internal_1.asOffset)(1);
            this._subscriptionManager.toDoing(topic, nextOffset);
            setTimeout(() => this._newPullTask(topic, nextOffset), this._options.pullInterval);
            this._onMsgs.get(topic)(lastOffset);
        })
            .catch((reason) => {
            if (reason instanceof maxwell_utils_1.TimeoutError) {
                console.debug(`Timeout occured: ${reason.message}, will pull again...`);
                setTimeout(() => this._newPullTask(topic, offset), 0);
            }
            else if (reason instanceof abortable_promise_1.AbortError) {
                console.debug(`Task aborted, stop pulling.`);
            }
            else {
                console.error(`Error occured: ${reason.stack}, will pull again...`);
                setTimeout(() => this._newPullTask(topic, offset), 1000);
            }
        });
        this._pullTasks.set(topic, pullTask);
    }
    _deletePullTask(topic) {
        const task = this._pullTasks.get(topic);
        if (typeof task !== "undefined") {
            task.abort();
            this._pullTasks.delete(topic);
        }
    }
    _deleteAllPullTasks() {
        for (const task of this._pullTasks.values()) {
            task.abort();
        }
        this._pullTasks.clear();
    }
    _isValidSubscription(topic) {
        return (this._subscriptionManager.has(topic) &&
            this._queueManager.has(topic) &&
            this._onMsgs.has(topic));
    }
    _createPullReq(topic, offset) {
        return new maxwell_protocol_1.msg_types.pull_req_t({
            topic: topic,
            offset: offset,
            limit: this._options.pullLimit,
        });
    }
    _createReqReq(path, payload, headers) {
        return new maxwell_protocol_1.msg_types.req_req_t({
            path,
            payload: JSON.stringify(payload ? payload : {}),
            header: headers ? headers : {},
        });
    }
}
exports.Frontend = Frontend;
exports.default = Frontend;
//# sourceMappingURL=frontend.js.map