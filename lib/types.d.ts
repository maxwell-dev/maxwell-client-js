import { msg_types } from "maxwell-protocol";
export type Offset = number;
export declare function asOffset(offset: number | bigint): Offset;
export type Msg = typeof msg_types.msg_t.prototype;
export type ProtocolMsg = any;
export type Timer = NodeJS.Timer | number;
export type OnMsg = (offset?: Offset) => void;
