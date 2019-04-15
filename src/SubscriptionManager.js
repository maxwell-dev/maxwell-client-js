class SubscriptionManager {

  constructor() {
    this._pendings = new Map();
    this._doings = new Map();
  }

  addSubscription(topic, offset) {
    this._pendings.set(topic, offset); // will pull from offset
    this._doings.delete(topic);
  }

  toDoing(topic, offset) {
    if (typeof offset === "undefined") {
      offset  = this._pendings.get(topic);
    }
    this._doings.set(topic, offset); // will pull from offset
    this._pendings.delete(topic);
  }

  toPendings() {
    for (let s of this._doings.entries()) {
      this.addSubscription(s[0], s[1]);
    }
  }

  deleteSubscription(topic) {
    this._pendings.delete(topic);
    this._doings.delete(topic);
  }

  clear() {
    this._pendings.clear();
    this._doings.clear();
  }

  getAllPendings() {
    return this._pendings.entries();
  }

  getAllDoings() {
    return this._doings.entries();
  }

  hasSubscribed(topic) {
    return this._pendings.has(topic) || this._doings.has(topic);
  }

}

module.exports = SubscriptionManager;
