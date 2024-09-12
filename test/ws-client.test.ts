import {
  AbortControllerPlus,
  AbortError,
  TimeoutError,
} from "@xuchaoqian/abortable-promise";
import * as ws from "../src/ws";

describe("ws client request", () => {
  it("normal request", async () => {
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    const response = await client.ws("/hello");
    expect(response).toEqual("world");
  });

  it("not exist path", async () => {
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      await client.ws("/not-exist-path");
    } catch (e) {
      expect(e.message).toMatch(
        'code: 299, desc: Failed to get connetion: err: Failed to find endpoint: path: "/not-exist-path"',
      );
    }
  });

  it("timeout by timeout", async () => {
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      await client.ws("/hello", { roundTimeout: 1 });
    } catch (e) {
      console.log(e);
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e.message).toMatch(
        '{"path":"/hello","payload":"{}","header":{},"ref',
      );
    }
  });

  it("timeout by signal", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      const controller = new AbortControllerPlus();
      await client.ws("/hello", { signal: controller.signal.timeout(1) });
      mockFn1();
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e.message).toBe("The operation was aborted due to timeout");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
  }, 1000000);

  it("abort promise by controller", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      const controller = new AbortControllerPlus();
      setTimeout(() => {
        controller.abort();
      }, 1);
      await client.ws("/hello", { signal: controller.signal });
      mockFn1();
    } catch (e) {
      expect(e).toBeInstanceOf(AbortError);
      expect(e.message).toBe("This operation was aborted");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
    client.close();
  }, 1000000);

  it("abort promise by self", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      const promise = client.ws("/hello");
      setTimeout(() => {
        promise.abort();
      }, 1);
      await promise;
      mockFn1();
    } catch (e) {
      expect(e).toBeInstanceOf(AbortError);
      expect(e.message).toBe("This operation was aborted");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
    client.close();
  }, 1000000);
});
