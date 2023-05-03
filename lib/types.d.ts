/// <reference types="node" />
import { msg_types } from "maxwell-protocol";
export type Msg = typeof msg_types.msg_t.prototype;
export type Offset = bigint;
export type ProtocolMsg = any;
export type Timer = NodeJS.Timer | number;
export type OnMsg = (offset?: Offset) => void;
