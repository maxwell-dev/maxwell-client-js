import Client from "../src/Client";
let client = new Client(["localhost:8081"], {
  sslEnabled: false,
  debugRoundEnabled: true,
});
let watcher = client.getWatcher();
let actionType = "get_candles";
watcher.watch(actionType, (actionHandler) => {
  console.log(
    "Received action: " +
      JSON.stringify(actionHandler.getAction()) +
      ", headers: " +
      JSON.stringify(actionHandler.getHeaders())
  );
  actionHandler.failed(1025, "nothing");
});
