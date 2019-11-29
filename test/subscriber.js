const msgpack = require("msgpack-lite");
const Client = require("../src/Client.js");
let client = new Client(["localhost:8081"], {sslEnabled: false});
let subscriber = client.getSubscriber();
let topic = "topic_3";
subscriber.subscribe(topic, 0, (_) => {
  let msgs = [];
  do {
    msgs = subscriber.receive(topic);
    msgs.forEach((msg) => {
      console.log("Comsumed msg: ", JSON.stringify(msg.value));
    });
  } while (msgs.length > 0);
});
