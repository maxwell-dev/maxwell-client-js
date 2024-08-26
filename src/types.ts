import { msg_types } from "maxwell-protocol";

export type Msg = typeof msg_types.msg_t.prototype;

export type Offset = number;
export function asOffset(offset: number | bigint): Offset {
  return typeof offset === "bigint" ? Number(offset) : offset;
}

export type ProtobufOffset = number;
export function asProtobufOffset(offset: number | bigint): ProtobufOffset {
  return typeof offset === "bigint" ? Number(offset) : offset;
}
