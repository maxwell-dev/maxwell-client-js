type Event = any;
type Result = any;
type Callback = (result?: Result) => void;
export declare class Listenable {
    private listeners;
    constructor();
    addListener(event: Event, callback: Callback): void;
    deleteListener(event: Event, callback: Callback): void;
    clear(): void;
    notify(event: Event, result?: Result): void;
}
export default Listenable;
