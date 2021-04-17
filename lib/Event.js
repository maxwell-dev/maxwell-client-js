"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var Event;
(function (Event) {
    Event[Event["ON_CONNECTING"] = 100] = "ON_CONNECTING";
    Event[Event["ON_CONNECTED"] = 101] = "ON_CONNECTED";
    Event[Event["ON_DISCONNECTING"] = 102] = "ON_DISCONNECTING";
    Event[Event["ON_DISCONNECTED"] = 103] = "ON_DISCONNECTED";
    Event[Event["ON_MESSAGE"] = 104] = "ON_MESSAGE";
    Event[Event["ON_ERROR"] = 1] = "ON_ERROR";
})(Event = exports.Event || (exports.Event = {}));
exports.default = Event;
//# sourceMappingURL=Event.js.map