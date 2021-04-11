export class Watcher {
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
export default Watcher;
//# sourceMappingURL=Watcher.js.map