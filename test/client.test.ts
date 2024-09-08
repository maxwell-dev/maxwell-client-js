import { Client } from "../src";

describe("client get", () => {
  it("normal request", async () => {
    const client = new Client(["localhost:8081"], {
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
    const client = new Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    const res = await client.get("/not-exist-path");
    expect(res.status).toBe(500);
    expect(res.statusText).toBe("Internal Server Error");
  });
});
