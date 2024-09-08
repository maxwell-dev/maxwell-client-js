import { Msg } from "./";

export type ConsumerKey = string | symbol;

export const DEFAULT_CONSUMER_KEY = Symbol("default");

export interface IConsumer {
  key(): ConsumerKey;
  onMsg(msgs?: Msg[], key?: ConsumerKey, topic?: string): Promise<void>;
}

export class DefaultConsumer implements IConsumer {
  constructor(
    onMsg: (msgs?: Msg[], key?: ConsumerKey, topic?: string) => Promise<void>,
  ) {
    this.onMsg = onMsg;
  }

  key(): ConsumerKey {
    return DEFAULT_CONSUMER_KEY;
  }

  onMsg: (msgs?: Msg[], key?: ConsumerKey, topic?: string) => Promise<void>;
}

export type FunctionConsumer = (
  msgs?: Msg[],
  key?: ConsumerKey,
  topic?: string,
) => Promise<void>;
