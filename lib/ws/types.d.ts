import { msg_types } from "maxwell-protocol";
export type Msg = typeof msg_types.msg_t.prototype;
export type Offset = number;
export declare function asOffset(offset: number | bigint): Offset;
export type ProtobufOffset = number;
export declare function asProtobufOffset(offset: number | bigint): ProtobufOffset;
