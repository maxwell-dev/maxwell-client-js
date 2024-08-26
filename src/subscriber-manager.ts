import { MultiAltEndpointsConnection } from "maxwell-utils";
import {
  Offset,
  Options,
  ConsumerKey,
  IConsumer,
  DefaultConsumer,
  FunctionConsumer,
  Subscriber,
} from "./internal";

export class SubscriberManager {
  private _connection: MultiAltEndpointsConnection;
  private _options: Required<Options>;
  private _subscribers: Map<string, Subscriber>; // { topic: Subscriber }

  constructor(
    connection: MultiAltEndpointsConnection,
    options: Required<Options>,
  ) {
    this._connection = connection;
    this._options = options;
    this._subscribers = new Map();
  }

  close(): void {
    for (const subscriber of this._subscribers.values()) {
      subscriber.close();
    }
    this._subscribers.clear();
  }

  subscribe(
    topic: string,
    offset: Offset,
    consumer: IConsumer | FunctionConsumer,
  ): boolean {
    let subscriber = this._subscribers.get(topic);
    if (typeof subscriber === "undefined") {
      subscriber = new Subscriber(
        topic,
        offset,
        this._connection,
        this._options,
      );
      this._subscribers.set(topic, subscriber);
    }
    if (typeof consumer === "function") {
      consumer = new DefaultConsumer(consumer);
    }
    const result = subscriber.addConsumer(consumer);
    if (!result) {
      console.debug(
        `Consumer already exists: topic: ${topic}, key: ${consumer.key().toString()}`,
      );
    }
    return result;
  }

  /**
   * will close the specified subscriber and deleted related consumers
   * if key is not provided
   */
  unsubscribe(topic: string, key?: ConsumerKey): boolean {
    const subscriber = this._subscribers.get(topic);
    if (typeof subscriber === "undefined") {
      console.debug(`Subscriber not found: topic: ${topic}`);
      return false;
    }
    if (typeof key === "undefined") {
      console.debug(`Delete all consumers: topic: ${topic}`);
      this._subscribers.delete(topic);
      subscriber.close();
      return true;
    }
    const result = subscriber.deleteConsumer(key);
    if (!result) {
      console.debug(
        `Consumer not found: topic: ${topic}, key: ${key.toString()}`,
      );
    }
    if (subscriber.countConsumers() < 1) {
      console.debug(`No consumer left, delete it: topic: ${topic}`);
      this._subscribers.delete(topic);
      subscriber.close();
    }
    return result;
  }
}
