"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asOffset = asOffset;
exports.asProtobufOffset = asProtobufOffset;
function asOffset(offset) {
    return typeof offset === "bigint" ? Number(offset) : offset;
}
function asProtobufOffset(offset) {
    return typeof offset === "bigint" ? Number(offset) : offset;
}
//# sourceMappingURL=types.js.map