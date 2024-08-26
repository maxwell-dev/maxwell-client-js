import * as maxwell from "../src";

const client = maxwell.Client.create(["localhost:8081"], { 
  sslEnabled: false, roundLogEnabled: false, localStoreEnabled: false,
});

const topic = "topic_1";
const key0 = maxwell.DEFAULT_CONSUMER_KEY;
const key1 = "key_1";
const key2 = "key_2";
const key3 = "key_3";
client.subscribe(topic, -1, (msgs, key, topic) => {
  msgs.forEach((msg) => {
    console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
  });
});

// will fail, because it is the same key as the previous one
client.subscribe(topic, -1, {
  key() {
    return key0;
  },
  onMsg(msgs, key, topic) {
    msgs.forEach((msg) => {
      console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
    });
  }
});

client.subscribe(topic, -1, {
  key() {
    return key1
  },
  onMsg(msgs, key, topic) {
    msgs.forEach((msg) => {
      console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
    });
  }
});

client.subscribe(topic, -1, {
  key() {
    return key2;
  },
  onMsg(msgs, key, topic) {
    msgs.forEach((msg) => {
      console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
    });
  }
});

client.subscribe(topic, -1, {
  key() {
    return key3;
  },
  async onMsg(msgs, key, topic) {
    msgs.forEach((msg) => {
      console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
    });
  }
});

setTimeout(() => { 
  console.info("****** Unsubscribing %s/%s ******", topic, key3);
  client.unsubscribe(topic, key3);
}, 5000);

setTimeout(() => { 
  console.info("****** Unsubscribing %s/%s ******", topic, key2);
  client.unsubscribe(topic, key2);
}, 10000);

setTimeout(() => { 
  console.info("****** Unsubscribing %s/%s ******", topic, key1);
  client.unsubscribe(topic, key1);
}, 15000);

// will close the subscriber, because no consumers are left
setTimeout(() => { 
  console.info("****** Unsubscribing %s/%s ******", topic, key0.toString());
  client.unsubscribe(topic, key0);
}, 20000);

setTimeout(() => {
  client.subscribe(topic, -1, {
    key() {
      return key0;
    },
    onMsg(msgs, key, topic) {
      msgs.forEach((msg) => {
        console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
      });
    }
  });

  client.subscribe(topic, -1, {
    key() {
      return key1
    },
    onMsg(msgs, key, topic) {
      msgs.forEach((msg) => {
        console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
      });
    }
  });
}, 21000);

// will close the subscriber directly
setTimeout(() => { 
  console.info("****** Unsubscribing %s ******", topic);
  client.unsubscribe(topic);
}, 26000);


setTimeout(() => {
  client.subscribe(topic, -1, {
    key() {
      return key0;
    },
    onMsg(msgs, key, topic) {
      msgs.forEach((msg) => {
        console.log(`${topic}/${key.toString()} [${msg.offset}] ${new Date(msg.timestamp*1000)}`);
      });
    }
  });

}, 27000);
