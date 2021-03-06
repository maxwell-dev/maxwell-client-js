import { msg_types } from "maxwell-protocol";
import { ActionHandler } from "./ActionHandler";

export type Msg = typeof msg_types.msg_t.prototype;

export type Offset = number;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProtocolMsg = any;

export type Timer = NodeJS.Timer | number;

export type OnMsg = (offset?: Offset) => void;

export type OnAction = (actionHandler: ActionHandler) => void;
