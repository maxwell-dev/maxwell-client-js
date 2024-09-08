import {
  AbortControllerPlus,
  AbortError,
  TimeoutError,
} from "@xuchaoqian/abortable-promise";
import * as http from "../src/http";

describe("http client get", () => {
  it("normal request", async () => {
    const client = new http.Client(["localhost:8081"], {
      endpointPicker: "random",
    });
    const res = await client.get("/$pick-frontends");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      code: 0,
      endpoints: ["127.0.0.1:10000"],
    });
  });

  it("not exist path", async () => {
    const client = new http.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    const res = await client.get("/not-exist-path");
    expect(res.status).toBe(500);
    expect(res.statusText).toBe("Internal Server Error");
  });

  it("timeout by timeout", async () => {
    const client = new http.Client(["github.com"], {
      endpointPicker: "round-robin",
      sslEnabled: true,
    });
    try {
      const res = await client.get(
        "/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
        { timeout: 10 },
      );
      expect(res.status).toBe(200);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e.message).toBe("The operation was aborted due to timeout");
    }
  });

  it("timeout by signal", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new http.Client(["github.com"], {
      endpointPicker: "round-robin",
      sslEnabled: true,
    });
    try {
      const controller = new AbortControllerPlus();
      const res = await client.get(
        "/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
        { signal: controller.signal.timeout(10) },
      );
      mockFn1();
      expect(res.status).toBe(200);
      const data = await res.blob();
      expect(data.size).toBeGreaterThan(0);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e.message).toBe("The operation was aborted due to timeout");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
  }, 1000000);

  it("abort promise by controller", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new http.Client(["github.com"], {
      endpointPicker: "round-robin",
      sslEnabled: true,
    });
    try {
      const controller = new AbortControllerPlus();
      setTimeout(() => {
        controller.abort();
      }, 10);
      const res = await client.get(
        "/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
        { signal: controller.signal },
      );
      mockFn1();
      expect(res.status).toBe(200);
      const data = await res.blob();
      expect(data.size).toBeGreaterThan(0);
    } catch (e) {
      expect(e).toBeInstanceOf(AbortError);
      expect(e.message).toBe("This operation was aborted");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
  }, 1000000);

  it("abort promise by self", async () => {
    expect.assertions(3);
    const mockFn1 = jest.fn();
    const client = new http.Client(["github.com"], {
      endpointPicker: "round-robin",
      sslEnabled: true,
    });
    try {
      const promise = client.get(
        "/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
      );
      setTimeout(() => {
        promise.abort();
      }, 10);
      const res = await promise;
      mockFn1();
      expect(res.status).toBe(200);
      const data = await res.blob();
      expect(data.size).toBeGreaterThan(0);
    } catch (e) {
      expect(e).toBeInstanceOf(AbortError);
      expect(e.message).toBe("This operation was aborted");
    }
    expect(mockFn1).toHaveBeenCalledTimes(0);
  }, 1000000);
});
