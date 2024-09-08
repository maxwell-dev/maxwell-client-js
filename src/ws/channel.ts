import { AbortablePromise } from "@xuchaoqian/abortable-promise";
import { Event, Listenable, IConnection, IEventHandler } from "maxwell-utils";
import { Options, EndpointPicker, createEndpointPicker } from "../internal";

export class Channel extends Listenable implements IEventHandler {
  protected readonly options: Required<Options>;
  protected readonly endpointPicker: EndpointPicker;
  private _failedToConnect: boolean;

  //===========================================
  // APIs
  //===========================================

  constructor(endpoints: string[], options: Required<Options>) {
    super();
    this.options = options;
    this.endpointPicker = createEndpointPicker(endpoints, options);
    this._failedToConnect = false;
  }

  //===========================================
  // IEventHandler implementation
  //===========================================

  onConnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_CONNECTING, connection, ...rest);
  }

  onConnected(connection: IConnection, ...rest: any[]): void {
    this._failedToConnect = false;
    this.notify(Event.ON_CONNECTED, connection, ...rest);
  }

  onDisconnecting(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_DISCONNECTING, connection, ...rest);
  }

  onDisconnected(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_DISCONNECTED, connection, ...rest);
  }

  onCorrupted(connection: IConnection, ...rest: any[]): void {
    this._failedToConnect = true;
    this.notify(Event.ON_CORRUPTED, connection, ...rest);
  }

  onBecameUnhealthy(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_BECAME_UNHEALTHY, connection, ...rest);
  }

  onBecameHealthy(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_BECAME_HEALTHY, connection, ...rest);
  }

  onBecameIdle(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_BECAME_IDLE, connection, ...rest);
  }

  onBecameActive(connection: IConnection, ...rest: any[]): void {
    this.notify(Event.ON_BECAME_ACTIVE, connection, ...rest);
  }

  //===========================================
  // Inheritable functions
  //===========================================

  protected pickEndpoint(): AbortablePromise<string> {
    return this.endpointPicker.pick(this._failedToConnect);
  }
}

export default Channel;
