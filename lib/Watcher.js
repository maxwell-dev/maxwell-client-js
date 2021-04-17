"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = void 0;
class Watcher {
    constructor(frontend) {
        this._frontend = frontend;
    }
    watch(actionType, onAction) {
        this._frontend.watch(actionType, onAction);
    }
    unwatch(actionType) {
        this._frontend.unwatch(actionType);
    }
}
exports.Watcher = Watcher;
exports.default = Watcher;
//# sourceMappingURL=Watcher.js.map