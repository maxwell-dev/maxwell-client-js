"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
const abortable_promise_1 = require("@xuchaoqian/abortable-promise");
const maxwell_protocol_1 = require("maxwell-protocol");
const maxwell_utils_1 = require("maxwell-utils");
const internal_1 = require("./internal");
class Subscriber {
    constructor(topic, offset, connection, options) {
        this._topic = topic;
        this._connection = connection;
        this._options = options;
        this._queue = new internal_1.Queue(this._options.queueCapacity);
        this._queueCond = new maxwell_utils_1.Condition(void 0, () => this._queue.size() > 0);
        this._consumers = new Map();
        this._nextOffset = offset;
        this._shouldRun = true;
        this._repeatPull();
        this._repeatConsume();
    }
    close() {
        this._shouldRun = false;
        this._pullTask?.abort();
        this._consumeTask?.abort();
        this._consumers.clear();
        this._queue.clear();
    }
    addConsumer(consumer) {
        if (this._consumers.has(consumer.key())) {
            return false;
        }
        this._consumers.set(consumer.key(), consumer);
        return true;
    }
    deleteConsumer(key) {
        return this._consumers.delete(key);
    }
    hasConsumer(key) {
        return this._consumers.has(key);
    }
    countConsumers() {
        return this._consumers.size;
    }
    async _repeatPull() {
        while (this._shouldRun) {
            try {
                this._pullTask = abortable_promise_1.AbortablePromise.from(this._pull());
                await this._pullTask;
            }
            catch (e) {
                if (e instanceof maxwell_utils_1.TimeoutError) {
                    console.debug(`Puller was idle: req: ${e.message}, will pull again...`);
                }
                else if (e instanceof abortable_promise_1.AbortError) {
                    console.debug(`Pull task aborted: topic: ${this._topic}, stop pulling.`);
                    break;
                }
                else {
                    console.error(`Error occured: reason: ${e.stack}, will pull again...`);
                    await this._sleep(1000);
                }
            }
        }
    }
    async _pull() {
        if (this._queue.isFull()) {
            console.warn(`Queue(${this._topic}) is full(${this._queue.size()}), waiting for consuming...`);
            this._queueCond.notify();
            await this._sleep(1000);
            return;
        }
        const pullReq = this._createPullReq();
        if (!this._connection.isOpen()) {
            await this._connection.waitOpen(this._options.waitOpenTimeout);
        }
        const pullRep = await this._connection.request(pullReq, this._options.roundTimeout);
        if (pullRep.msgs.length < 1) {
            console.info(`No msgs pulled: topic: ${this._topic}, offset: ${pullReq.offset}`);
            await this._sleep(this._options.pullInterval);
            return;
        }
        this._queue.put(pullRep.msgs);
        this._nextOffset = this._queue.lastOffset() + (0, internal_1.asOffset)(1);
        this._queueCond.notify();
        await this._sleep(this._options.pullInterval);
        return;
    }
    async _repeatConsume() {
        while (this._shouldRun) {
            try {
                this._consumeTask = this._queueCond.wait().then(() => {
                    return abortable_promise_1.AbortablePromise.from(this._consume());
                });
                await this._consumeTask;
            }
            catch (e) {
                if (e instanceof maxwell_utils_1.TimeoutError) {
                    console.debug(`Consumers were idle: topic: ${this._topic}, will consume again...`);
                }
                else if (e instanceof abortable_promise_1.AbortError) {
                    console.debug(`Consume task aborted: topic: ${this._topic}, stop consuming.`);
                    break;
                }
                else {
                    console.error(`Error occured: reason: ${e.stack}, will consume again...`);
                }
            }
        }
    }
    async _consume() {
        while (this._queue.size() > 0) {
            const msgs = this._queue.getFrom(0, this._options.consumeBatchSize);
            if (msgs.length < 1) {
                return;
            }
            for (const [key, consumer] of this._consumers.entries()) {
                await consumer.onMsg(msgs, key, this._topic);
            }
            this._queue.deleteTo((0, internal_1.asOffset)(msgs[msgs.length - 1].offset));
            if (this._options.consumeBatchInterval > 0) {
                await this._sleep(this._options.consumeBatchInterval);
            }
        }
    }
    _createPullReq() {
        return new maxwell_protocol_1.msg_types.pull_req_t({
            topic: this._topic,
            offset: (0, internal_1.asProtobufOffset)(this._nextOffset),
            limit: this._options.pullLimit,
        });
    }
    async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.Subscriber = Subscriber;
//# sourceMappingURL=subscriber.js.map