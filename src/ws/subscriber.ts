import {
  AbortError,
  TimeoutError,
  AbortablePromise,
} from "@xuchaoqian/abortable-promise";
import { msg_types } from "maxwell-protocol";
import { Condition, MultiAltEndpointsConnection, sleep } from "maxwell-utils";
import { Options } from "../internal";
import {
  Msg,
  Offset,
  asOffset,
  asProtobufOffset,
  Queue,
  ConsumerKey,
  IConsumer,
} from "./";

export class Subscriber {
  private readonly _topic: string;
  private readonly _connection: MultiAltEndpointsConnection;
  private readonly _options: Required<Options>;
  private _queue: Queue;
  private _queueCond: Condition<void>;
  private _consumers: Map<ConsumerKey, IConsumer>;
  private _nextOffset: Offset;
  private _shouldRun: boolean;
  private _currPullTask: AbortablePromise<void> | undefined;
  private _currConsumeTask: AbortablePromise<void> | undefined;

  constructor(
    topic: string,
    offset: Offset,
    connection: MultiAltEndpointsConnection,
    options: Required<Options>,
  ) {
    this._topic = topic;
    this._connection = connection;
    this._options = options;
    this._queue = new Queue(this._options.queueCapacity);
    this._queueCond = new Condition(void 0, () => this._queue.size() > 0);
    this._consumers = new Map();
    this._nextOffset = offset;
    this._shouldRun = true;

    this._repeatPull();
    this._repeatConsume();
  }

  close(): void {
    this._shouldRun = false;
    this._currPullTask?.abort(new AbortError());
    this._currConsumeTask?.abort(new AbortError());
    this._consumers.clear();
    this._queue.clear();
  }

  addConsumer(consumer: IConsumer): boolean {
    if (this._consumers.has(consumer.key())) {
      return false;
    }
    this._consumers.set(consumer.key(), consumer);
    return true;
  }

  deleteConsumer(key: ConsumerKey): boolean {
    return this._consumers.delete(key);
  }

  hasConsumer(key: ConsumerKey): boolean {
    return this._consumers.has(key);
  }

  countConsumers(): number {
    return this._consumers.size;
  }

  //===========================================
  // internal functions
  //===========================================

  async _repeatPull(): Promise<void> {
    while (this._shouldRun) {
      try {
        this._currPullTask = AbortablePromise.from(this._pull());
        await this._currPullTask;
      } catch (e: any) {
        if (e instanceof TimeoutError) {
          console.debug(
            `Puller was idle: req: ${e.message}, will pull again...`,
          );
        } else if (e instanceof AbortError) {
          console.debug(
            `Pull task aborted: topic: ${this._topic}, stop pulling.`,
          );
          break;
        } else {
          console.error(
            `Error occured: reason: ${e.stack}, will pull again...`,
          );
          await sleep(1000);
        }
      }
    }
  }

  async _pull(): Promise<void> {
    if (this._queue.isFull()) {
      console.warn(
        `Queue(${this._topic}) is full(${this._queue.size()}), waiting for consuming...`,
      );
      this._queueCond.notify();
      await sleep(1000);
      return;
    }

    const pullReq = this._createPullReq();
    if (!this._connection.isOpen()) {
      await this._connection.waitOpen({
        timeout: this._options.waitOpenTimeout,
      });
    }
    const pullRep = await this._connection.request(pullReq, {
      timeout: this._options.roundTimeout,
    });
    if (pullRep.msgs.length < 1) {
      console.info(
        `No msgs pulled: topic: ${this._topic}, offset: ${pullReq.offset}`,
      );
      await sleep(1000);
      return;
    }
    this._queue.put(pullRep.msgs as Msg[]);
    this._nextOffset = this._queue.lastOffset() + asOffset(1);
    this._queueCond.notify();
    if (this._options.pullInterval > 0) {
      await sleep(this._options.pullInterval);
    }
  }

  async _repeatConsume(): Promise<void> {
    while (this._shouldRun) {
      try {
        this._currConsumeTask = this._queueCond.wait().then(() => {
          return AbortablePromise.from(this._consume());
        });
        await this._currConsumeTask;
      } catch (e: any) {
        if (e instanceof TimeoutError) {
          console.debug(
            `Consumers were idle: topic: ${this._topic}, will consume again...`,
          );
        } else if (e instanceof AbortError) {
          console.debug(
            `Consume task aborted: topic: ${this._topic}, stop consuming.`,
          );
          break;
        } else {
          console.error(
            `Error occured: reason: ${e.stack}, will consume again...`,
          );
        }
      }
    }
  }

  async _consume(): Promise<void> {
    while (this._queue.size() > 0) {
      const msgs = this._queue.getFrom(0, this._options.consumeBatchSize);
      if (msgs.length < 1) {
        return;
      }
      for (const [key, consumer] of this._consumers.entries()) {
        await consumer.onMsg(msgs, key, this._topic);
      }
      this._queue.deleteTo(asOffset(msgs[msgs.length - 1].offset));
      if (this._options.consumeBatchInterval > 0) {
        await sleep(this._options.consumeBatchInterval);
      }
    }
  }

  _createPullReq(): typeof msg_types.pull_req_t.prototype {
    return new msg_types.pull_req_t({
      topic: this._topic,
      offset: asProtobufOffset(this._nextOffset),
      limit: this._options.pullLimit,
    });
  }
}
