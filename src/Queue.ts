import { Msg, Offset } from "./types";

export class Queue {
  private _capacity: number;
  private _array: Msg[];

  constructor(capacity: number) {
    this._capacity = capacity;
    this._array = [];
  }

  put(msgs: Msg[]): void {
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

  deleteFirst(): void {
    if (this._array.length > 0) {
      this._array.splice(0, 1);
    }
  }

  deleteTo(offset: Offset): void {
    if (offset < 0) {
      return;
    }
    const maxIndex = this.maxIndexTo(offset);
    this._array.splice(0, maxIndex + 1);
  }

  clear(): void {
    this._array.splice(0, this._array.length);
  }

  getFrom(offset: Offset, limit: number): Msg[] {
    const result: Msg[] = [];
    if (offset < 0) {
      offset = 0;
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

  size(): number {
    return this._array.length;
  }

  isFull(): boolean {
    return this._array.length === this._capacity;
  }

  firstOffset(): Offset {
    if (this._array.length <= 0) {
      return -1;
    }
    return this._array[0].offset;
  }

  lastOffset(): Offset {
    if (this._array.length <= 0) {
      return -1;
    }
    return this._array[this._array.length - 1].offset;
  }

  minIndexFrom(offset: Offset): number {
    let index = -1;
    for (let i = 0; i < this._array.length; i++) {
      if (this._array[i].offset >= offset) {
        index = i;
        break;
      }
    }
    return index;
  }

  maxIndexTo(offset: Offset): number {
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

export default Queue;
