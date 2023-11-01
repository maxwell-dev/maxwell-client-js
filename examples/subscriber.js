import Client from "../src/client";
const client = new Client(["localhost:8081"], { sslEnabled: false, debugRoundEnabled: false });

const topic = "topic_1";
client.subscribe(topic, -1, () => {
  let msgs = [];
  do {
    msgs = client.receive(topic);
    msgs.forEach((msg) => {
      console.log(`**********[${msg.offset}] ${new Date(msg.timestamp*1000)}`);
    });
  } while (msgs.length > 0);
});
