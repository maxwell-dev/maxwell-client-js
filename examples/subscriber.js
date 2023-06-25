import Client from "../src/client";
let client = new Client(["localhost:8081"], { sslEnabled: false });
let topic = "topic_3";

client.subscribe(topic, -1, () => {
  let msgs = [];
  do {
    msgs = client.receive(topic);
    msgs.forEach((msg) => {
      console.log("Comsumed msg: ", msg.value);
    });
  } while (msgs.length > 0);
});
