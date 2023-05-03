import { IOptions, Subscriber, Requester } from "./internal";
export declare class Client {
    private _endpoints;
    private _options;
    private _connectionManager;
    private _frontend;
    private _requester;
    private _subscriber;
    constructor(endpoints: string[], options?: IOptions);
    close(): void;
    getRequester(): Requester;
    getSubscriber(): Subscriber;
    private _ensureRequesterInited;
    private _ensureSubscriberInited;
    private _ensureFrontendInited;
}
export default Client;
