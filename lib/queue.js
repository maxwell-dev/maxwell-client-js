"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const internal_1 = require("./internal");
class Queue {
    constructor(capacity) {
        this._capacity = capacity;
        this._array = [];
    }
    put(msgs) {
        if (msgs.length <= 0) {
            return;
        }
        const minIndex = this.minIndexFrom(msgs[0].offset);
        if (minIndex > -1) {
            this._array.splice(minIndex, this._array.length);
        }
        for (let i = 0; i < msgs.length; i++) {
            if (this._array.length >= this._capacity) {
                break;
            }
            this._array.push(msgs[i]);
        }
    }
    deleteFirst() {
        if (this._array.length > 0) {
            this._array.splice(0, 1);
        }
    }
    deleteTo(offset) {
        if (offset < 0) {
            return;
        }
        const maxIndex = this.maxIndexTo(offset);
        this._array.splice(0, maxIndex + 1);
    }
    clear() {
        this._array.splice(0, this._array.length);
    }
    getFrom(offset, limit) {
        const result = [];
        if (offset < 0) {
            offset = (0, internal_1.asOffset)(0);
        }
        if (limit <= 0 || this._array.length <= 0) {
            return result;
        }
        if (limit > this._array.length) {
            limit = this._array.length;
        }
        const startIndex = this.minIndexFrom(offset);
        const endIndex = startIndex + limit - 1;
        for (let i = startIndex; i <= endIndex; i++) {
            result.push(this._array[i]);
        }
        return result;
    }
    size() {
        return this._array.length;
    }
    isFull() {
        return this._array.length === this._capacity;
    }
    firstOffset() {
        if (this._array.length <= 0) {
            return (0, internal_1.asOffset)(-1);
        }
        return (0, internal_1.asOffset)(this._array[0].offset);
    }
    lastOffset() {
        if (this._array.length <= 0) {
            return (0, internal_1.asOffset)(-1);
        }
        return (0, internal_1.asOffset)(this._array[this._array.length - 1].offset);
    }
    minIndexFrom(offset) {
        let index = -1;
        for (let i = 0; i < this._array.length; i++) {
            if (this._array[i].offset >= offset) {
                index = i;
                break;
            }
        }
        return index;
    }
    maxIndexTo(offset) {
        let index = -1;
        for (let i = 0; i < this._array.length; i++) {
            if (this._array[i].offset > offset) {
                break;
            }
            index = i;
        }
        return index;
    }
}
exports.Queue = Queue;
exports.default = Queue;
//# sourceMappingURL=queue.js.map