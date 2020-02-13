const Client = require("../src/Client.js");
let client = new Client(["localhost:8081"], { sslEnabled: false });
let watcher = client.getWatcher();
let actionType = "get_candles";
watcher.watch(actionType, action => {
  console.log("Received result: ", action);
  action.failed(1025, "nothing");
});
