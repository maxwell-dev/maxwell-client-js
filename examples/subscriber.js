import { decode } from "@msgpack/msgpack";
import Client from "../src/Client";
let client = new Client(["localhost:8081"], { sslEnabled: false });
let subscriber = client.getSubscriber();
let topic = "topic_3";

subscriber.subscribe(topic, 0, () => {
  let msgs = [];
  do {
    msgs = subscriber.receive(topic);
    msgs.forEach((msg) => {
      console.log("Comsumed msg: ", decode(msg.value));
    });
  } while (msgs.length > 0);
});
