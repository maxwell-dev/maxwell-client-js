import { encode } from "@msgpack/msgpack";
import Client from "../src/Client";
let client = new Client(["localhost:8081"], { sslEnabled: false });
let publisher = client.getPublisher();

(function loop() {
  let p = publisher.publish("topic_3", encode({ hello: "maxwell" }));
  p.then(() => {
    console.log(`Sent done @${new Date()}`);
    setTimeout(loop, 1000);
  }).catch((reason) => {
    console.error(`Error occured: ${reason.stack}`);
    setTimeout(loop, 1000);
  });
})();
