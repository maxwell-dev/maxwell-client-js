export class Subscriber {
    constructor(frontend) {
        this._frontend = frontend;
    }
    subscribe(topic, offset, onMsg) {
        this._frontend.subscribe(topic, offset, onMsg);
    }
    unsubscribe(topic) {
        this._frontend.unsubscribe(topic);
    }
    get(topic, offset, limit) {
        return this._frontend.get(topic, offset, limit);
    }
    commit(topic, offset) {
        this._frontend.commit(topic, offset);
    }
    receive(topic, offset, limit) {
        return this._frontend.receive(topic, offset, limit);
    }
}
export default Subscriber;
//# sourceMappingURL=Subscriber.js.map