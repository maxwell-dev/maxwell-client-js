import Options from "./Options";
import Connection from "./Connection";
export declare class ConnectionManager {
    private _options;
    private _connections;
    private _refCounts;
    constructor(options: Options);
    fetch(endpoint: string): Connection;
    release(connection: Connection): void;
    close(): void;
}
export default ConnectionManager;
