import {
  AbortControllerPlus,
  AbortError,
  TimeoutError,
} from "@xuchaoqian/abortable-promise";
import * as ws from "../src/ws";

describe("ws client get", () => {
  it("normal request", async () => {
    const client = new ws.Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    const res = await client.ws("/hello");
    expect(res).toEqual("world");
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
});
