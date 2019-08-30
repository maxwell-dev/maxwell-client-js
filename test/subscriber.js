const msgpack = require("msgpack-lite");
const Client = require("../src/Client.js");

let client = new Client(["localhost:8081", "39.106.163.224:8081"]);
let subscriber = client.getSubscriber();
console.error(client);
let topic = "/v2/market/summary/market_change?huobi.btc.usdt";
subscriber.subscribe(topic, 0, (_) => {
  let msgs = [];
  do {
    msgs = subscriber.receive(topic);
    msgs.forEach((msg) => {
      console.log("Comsumed msg: ", JSON.stringify(msgpack.decode(msg.value)));
    });
  } while (msgs.length > 0);
});
