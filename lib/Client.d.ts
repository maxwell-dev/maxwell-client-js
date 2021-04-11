import IOptionalOptions from "./IOptionalOptions";
import Subscriber from "./Subscriber";
import Doer from "./Doer";
import Wather from "./Watcher";
import { Publisher } from "./Publisher";
export declare class Client {
    private _endpoints;
    private _options;
    private _connectionManager;
    private _frontend;
    private _doer;
    private _watcher;
    private _publisher;
    private _subscriber;
    constructor(endpoints: string[], options?: IOptionalOptions);
    close(): void;
    getDoer(): Doer;
    getWatcher(): Wather;
    getPublisher(): Publisher;
    getSubscriber(): Subscriber;
    private _ensureFrontendInited;
    private _ensureDoerInited;
    private _ensureWatcherInited;
    private _ensurePublisherInited;
    private _ensureSubscriberInited;
}
export default Client;
