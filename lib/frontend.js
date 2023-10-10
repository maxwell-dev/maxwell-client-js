"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frontend = void 0;
const maxwell_protocol_1 = require("maxwell-protocol");
const internal_1 = require("./internal");
class Frontend extends internal_1.Listenable {
    constructor(endpoints, connectionManager, options) {
        super();
        this._endpoints = endpoints;
        this._connectionManager = connectionManager;
        this._options = options;
        this._subscriptionManager = new internal_1.SubscriptionManager();
        this._queueManager = new internal_1.QueueManager(this._options.queueCapacity || 1024);
        this._onMsgs = new Map();
        this._pullTasks = new Map();
        this._master = new internal_1.Master(this._endpoints, this._options);
        this._connection = null;
        this._endpointIndex = -1;
        this._failedToConnect = false;
        this._connectToFrontend();
        this._condition = new internal_1.Condition(() => {
            return this._isConnectionOpen();
        });
    }
    close() {
        this._condition.clear();
        this._disconnectFromFrontend();
        this._deleteAllPullTasks();
        this._onMsgs.clear();
        this._queueManager.clear();
        this._subscriptionManager.clear();
    }
    subscribe(topic, offset, onMsg) {
        if (this._subscriptionManager.has(topic)) {
            console.warn(`Already subscribed: topic: ${topic}`);
            return;
        }
        this._subscriptionManager.addSubscription(topic, offset);
        this._queueManager.get_or_set(topic);
        this._onMsgs.set(topic, onMsg);
        if (this._isConnectionOpen()) {
            this._newPullTask(topic, offset);
        }
    }
    unsubscribe(topic) {
        this._deletePullTask(topic);
        this._onMsgs.delete(topic);
        this._queueManager.delete(topic);
        this._subscriptionManager.deleteSubscription(topic);
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
    async request(path, payload, headers) {
        const result = await this._waitAndRequest(this._createReqReq(path, payload, headers));
        return JSON.parse(result.payload);
    }
    _connectToFrontend() {
        this._pickEndpoint().then((endpoint) => {
            this._connection = this._connectionManager.fetch(endpoint);
            this._connection.addListener(internal_1.Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
            this._connection.addListener(internal_1.Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
            this._connection.addListener(internal_1.Event.ON_DISCONNECTED, this._onDisconnectFromFrontendDone.bind(this));
        }, (reason) => {
            console.error(`Failed to pick endpoint: ${reason.stack}`);
            setTimeout(() => this._connectToFrontend(), 1000);
        });
    }
    _disconnectFromFrontend() {
        if (!this._connection) {
            return;
        }
        this._connection.deleteListener(internal_1.Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
        this._connection.deleteListener(internal_1.Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
        this._connection.deleteListener(internal_1.Event.ON_DISCONNECTED, this._onDisconnectFromFrontendDone.bind(this));
        this._connectionManager.release(this._connection);
        this._connection = null;
    }
    _onConnectToFrontendDone() {
        this._failedToConnect = false;
        this._condition.notify();
        this._renewAllTask();
        this.notify(internal_1.Event.ON_CONNECTED);
    }
    _onConnectToFrontendFailed(code) {
        if (code === internal_1.Code.FAILED_TO_CONNECT) {
            this._failedToConnect = true;
            this._disconnectFromFrontend();
            setTimeout(() => this._connectToFrontend(), 1000);
        }
    }
    _onDisconnectFromFrontendDone() {
        this._deleteAllPullTasks();
        this.notify(internal_1.Event.ON_DISCONNECTED);
    }
    _isConnectionOpen() {
        return this._connection !== null && this._connection.isOpen();
    }
    async _pickEndpoint() {
        if (this._options.masterEnabled) {
            return await this._master.pickFrontend(this._failedToConnect);
        }
        else {
            return Promise.resolve(this._nextEndpoint());
        }
    }
    _nextEndpoint() {
        this._endpointIndex += 1;
        if (this._endpointIndex >= this._endpoints.length) {
            this._endpointIndex = 0;
        }
        return this._endpoints[this._endpointIndex];
    }
    _renewAllTask() {
        this._subscriptionManager.toPendings();
        for (const p of this._subscriptionManager.getAllPendings()) {
            this._newPullTask(p[0], p[1]);
        }
    }
    _newPullTask(topic, offset) {
        this._deletePullTask(topic);
        if (!this._isValidSubscription(topic)) {
            console.debug(`Already unsubscribed: ${topic}`);
            return;
        }
        const queue = this._queueManager.get_or_set(topic);
        if (queue.isFull()) {
            console.warn(`Queue is full(${queue.size()}), waiting for consuming...`);
            setTimeout(() => this._newPullTask(topic, offset), 1000);
            this._onMsgs.get(topic)(queue.lastOffset());
            return;
        }
        if (this._connection === null) {
            console.warn("Connection was lost");
            return;
        }
        const pullTask = this._connection
            .request(this._createPullReq(topic, offset), 5000)
            .then((value) => {
            if (!this._isValidSubscription(topic)) {
                console.debug(`Already unsubscribed: ${topic}`);
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
            if (reason instanceof internal_1.TimeoutError) {
                console.debug(`Timeout occured: ${reason}, will pull again...`);
                setTimeout(() => this._newPullTask(topic, offset), 0);
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
            task.cancel();
            this._pullTasks.delete(topic);
        }
    }
    _deleteAllPullTasks() {
        for (const task of this._pullTasks.values()) {
            task.cancel();
        }
        this._pullTasks.clear();
    }
    _isValidSubscription(topic) {
        return (this._subscriptionManager.has(topic) &&
            this._queueManager.has(topic) &&
            this._onMsgs.has(topic));
    }
    async _waitAndRequest(msg) {
        await this._condition.wait(this._options.defaultRoundTimeout, msg);
        return await this._connection.request(msg).wait();
    }
    _createPullReq(topic, offset) {
        return new maxwell_protocol_1.msg_types.pull_req_t({
            topic: topic,
            offset: offset,
            limit: this._options.getLimit,
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