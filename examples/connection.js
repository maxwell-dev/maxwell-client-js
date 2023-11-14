import { Connection, Event, Options } from "maxwell-utils";

async function runOnce() {
  try {
    const conn = new Connection("localhost:10000", new Options());
    const onConnected = function onConnected() {
      conn.close();
    }
    conn.addListener(Event.ON_CONNECTED, onConnected);
  } catch (reason) {
    console.error(`Error occured: ${reason.stack}`);
  }
};

(async function run() {
  console.time("answer time@run");
  for (let i = 0; i < 100000000; i++) {
    await runOnce();
    await new Promise(r => setTimeout(r, 1));
  }
  console.timeEnd("answer time@run");
})()
