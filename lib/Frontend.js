var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { msg_types } from "maxwell-protocol";
import Code from "./Code";
import Event from "./Event";
import Listenable from "./Listenable";
import Condition from "./Condition";
import SubscriptionManager from "./SubscriptionManager";
import QueueManager from "./QueueManager";
import TimeoutError from "./TimeoutError";
import Master from "./Master";
import ActionHandler from "./ActionHandler";
export class Frontend extends Listenable {
    constructor(endpoints, connectionManager, options) {
        super();
        this._endpoints = endpoints;
        this._connectionManager = connectionManager;
        this._options = options;
        this._subscriptionManager = new SubscriptionManager();
        this._queueManager = new QueueManager(this._options.queueCapacity || 1024);
        this._onMsgs = new Map();
        this._pullTasks = new Map();
        this._onActions = new Map();
        this._watchActions = new Set();
        this._connection = null;
        this._endpointIndex = -1;
        this._connectToFrontend();
        this._condition = new Condition(() => {
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
            throw new Error(`Already subscribed: topic: ${topic}`);
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
            offset = 0;
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
    do(action, headers = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._waitAndRequest(this._createDoReq(action, headers));
            return JSON.parse(result.value);
        });
    }
    watch(actionType, onAction) {
        this._watchActions.add(actionType);
        this._onActions.set(actionType, onAction);
        if (this._isConnectionOpen()) {
            this._ensureWatched(actionType);
        }
    }
    unwatch(actionType) {
        this._watchActions.delete(actionType);
        this._onActions.delete(actionType);
        if (this._isConnectionOpen()) {
            this._ensureUnwatched(actionType);
        }
    }
    _connectToFrontend() {
        this._resolveEndpoint().then((endpoint) => {
            this._connection = this._connectionManager.fetch(endpoint);
            this._connection.addListener(Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
            this._connection.addListener(Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
            this._connection.addListener(Event.ON_DISCONNECTED, this._onDisconnectFromFrontendDone.bind(this));
            this._connection.addListener(Event.ON_MESSAGE, this._onAction.bind(this));
        }, (reason) => {
            console.error(`Failed to resolve endpoint: ${reason.stack}`);
            setTimeout(() => this._connectToFrontend(), 1000);
        });
    }
    _disconnectFromFrontend() {
        if (!this._connection) {
            return;
        }
        this._connection.deleteListener(Event.ON_CONNECTED, this._onConnectToFrontendDone.bind(this));
        this._connection.deleteListener(Event.ON_ERROR, this._onConnectToFrontendFailed.bind(this));
        this._connection.deleteListener(Event.ON_DISCONNECTED, this._onDisconnectFromFrontendDone.bind(this));
        this._connection.deleteListener(Event.ON_MESSAGE, this._onAction.bind(this));
        this._connectionManager.release(this._connection);
        this._connection = null;
    }
    _onConnectToFrontendDone() {
        this._condition.notify();
        this._renewAllTask();
        this._rewatch_all();
        this.notify(Event.ON_CONNECTED);
    }
    _onConnectToFrontendFailed(code) {
        if (code === Code.FAILED_TO_CONNECT) {
            this._disconnectFromFrontend();
            setTimeout(() => this._connectToFrontend(), 1000);
        }
    }
    _onDisconnectFromFrontendDone() {
        this._deleteAllPullTasks();
        this.notify(Event.ON_DISCONNECTED);
    }
    _isConnectionOpen() {
        return this._connection !== null && this._connection.isOpen();
    }
    _resolveEndpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._options.masterEnabled) {
                return Promise.resolve(this._nextEndpoint());
            }
            const master = new Master(this._endpoints, this._connectionManager, this._options);
            try {
                return yield master.resolveFrontend();
            }
            finally {
                master.close();
            }
        });
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
            this._onMsgs.get(topic)(offset - 1);
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
            const nextOffset = lastOffset + 1;
            this._subscriptionManager.toDoing(topic, nextOffset);
            setTimeout(() => this._newPullTask(topic, nextOffset), this._options.pullInterval);
            this._onMsgs.get(topic)(lastOffset);
        })
            .catch((reason) => {
            if (reason instanceof TimeoutError) {
                console.debug(`Timeout occured: ${reason}, will pull again...`);
                setTimeout(() => this._newPullTask(topic, offset), 10);
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
    _ensureWatched(actionType) {
        this._waitAndRequest(this._createWatchReq(actionType)).catch((reason) => {
            console.error(`Error occured: ${reason.stack}, will watch again...`);
            setTimeout(() => this._ensureWatched(actionType), 1000);
        });
    }
    _ensureUnwatched(actionType) {
        this._waitAndRequest(this._createUnwatchReq(actionType)).catch((reason) => {
            console.error(`Error occured: ${reason.stack}, will unwatch again...`);
            setTimeout(() => this._ensureUnwatched(actionType), 1000);
        });
    }
    _rewatch_all() {
        for (const actionType of this._watchActions) {
            this._ensureWatched(actionType);
        }
    }
    _onAction(doReq) {
        const callback = this._onActions.get(doReq.type);
        if (callback !== undefined && this._connection !== null) {
            try {
                callback(new ActionHandler(doReq, this._connection));
            }
            catch (e) {
                console.error(`Failed to notify: ${e.stack}`);
            }
        }
    }
    _waitAndRequest(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._condition.wait(this._options.defaultRoundTimeout, msg);
            return yield this._connection.request(msg).wait();
        });
    }
    _createPullReq(topic, offset) {
        return new msg_types.pull_req_t({
            topic: topic,
            offset: offset,
            limit: this._options.getLimit,
        });
    }
    _createDoReq(action, headers) {
        const doReq = new msg_types.do_req_t({
            type: action.type,
            value: JSON.stringify(action.value ? action.value : {}),
            traces: [new msg_types.trace_t()],
        });
        if (headers.sourceEnabled) {
            doReq.sourceEnabled = true;
        }
        return doReq;
    }
    _createWatchReq(actionType) {
        return new msg_types.watch_req_t({ type: actionType });
    }
    _createUnwatchReq(actionType) {
        return new msg_types.unwatch_req_t({ type: actionType });
    }
}
export default Frontend;
//# sourceMappingURL=Frontend.js.map