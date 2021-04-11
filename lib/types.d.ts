/// <reference types="node" />
import { msg_types } from "maxwell-protocol";
import { ActionHandler } from "./ActionHandler";
export declare type Msg = typeof msg_types.msg_t.prototype;
export declare type Offset = number;
export declare type ProtocolMsg = any;
export declare type Timer = NodeJS.Timer | number;
export declare type OnMsg = (offset?: Offset) => void;
export declare type OnAction = (actionHandler: ActionHandler) => void;
