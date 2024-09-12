import { Client } from "../src";

describe("client get", () => {
  it("normal request", async () => {
    const client = new Client(["localhost:8081"], {
      endpointPicker: "random",
    });
    const response = await client.get("/$pick-frontends");
    expect(response).toEqual({
      code: 0,
      endpoints: ["127.0.0.1:10000"],
    });
  });

  it("not exist path", async () => {
    const client = new Client(["localhost:8081"], {
      endpointPicker: "delegated",
    });
    try {
      await client.get("/not-exist-path");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "FetchError: Failed to get http://127.0.0.1:10000/not-exist-path, reason: 500 (Internal Server Error)",
      );
    }
  });
});
