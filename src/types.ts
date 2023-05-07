import { msg_types } from "maxwell-protocol";

export type Msg = typeof msg_types.msg_t.prototype;

// export type Offset = bigint;
// export function asOffset(offset: number | bigint): Offset {
//   return typeof offset === "bigint" ? offset : BigInt(offset);
// }

export type Offset = number;
export function asOffset(offset: number | bigint): Offset {
  return typeof offset === "bigint" ? Number(offset) : offset;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProtocolMsg = any;

export type Timer = NodeJS.Timer | number;

export type OnMsg = (offset?: Offset) => void;
