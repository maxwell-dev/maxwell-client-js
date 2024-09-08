import AbortablePromise from "@xuchaoqian/abortable-promise";
import { MasterClient, Options } from "./internal";

export interface EndpointPicker {
  pick(...args: any[]): AbortablePromise<string>;
}

export class RandomEndpointPicker implements EndpointPicker {
  private _endpoints: string[];

  constructor(endpoints: string[]) {
    this._endpoints = endpoints;
  }

  pick(): AbortablePromise<string> {
    return AbortablePromise.resolve(
      this._endpoints[Math.floor(Math.random() * this._endpoints.length)],
    );
  }
}

export class RoundRobinEndpointPicker implements EndpointPicker {
  private _endpoints: string[];
  private _index: number;

  constructor(endpoints: string[]) {
    this._endpoints = endpoints;
    this._index = 0;
  }

  pick(): AbortablePromise<string> {
    const endpoint = this._endpoints[this._index];
    this._index = (this._index + 1) % this._endpoints.length;
    return AbortablePromise.resolve(endpoint);
  }
}

export class DelegatedEndpointPicker implements EndpointPicker {
  private _masterClient: MasterClient;

  constructor(endpoints: string[], options: Options) {
    this._masterClient = MasterClient.getOrCreateInstance(endpoints, options);
  }

  pick(forceMaster: boolean = false): AbortablePromise<string> {
    return this._masterClient.pickFrontend(forceMaster);
  }
}

export function createEndpointPicker(
  endpoints: string[],
  options: Options,
): EndpointPicker {
  switch (options.endpointPicker) {
    case "random":
      return new RandomEndpointPicker(endpoints);
    case "round-robin":
      return new RoundRobinEndpointPicker(endpoints);
    case "delegated":
      return new DelegatedEndpointPicker(endpoints, options);
    default:
      throw new Error(`Unknown endpoint picker: ${options.endpointPicker}`);
  }
}
