"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asOffset = void 0;
function asOffset(offset) {
    return typeof offset === "bigint" ? Number(offset) : offset;
}
exports.asOffset = asOffset;
//# sourceMappingURL=types.js.map