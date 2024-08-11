"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asOffset = asOffset;
function asOffset(offset) {
    return typeof offset === "bigint" ? Number(offset) : offset;
}
//# sourceMappingURL=types.js.map