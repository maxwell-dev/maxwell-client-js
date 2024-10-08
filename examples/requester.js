import * as maxwell from "../src";

const client = maxwell.Client.create(["127.0.0.1:8081"], {
  sslEnabled: false,
  roundLogEnabled: false,
  localStoreEnabled: false,
});

async function loop() {
  try {
    const p = client.requestViaWs(
      "/hello",
      { content: "x".repeat(1) },
      { sourceEnabled: true },
    );
    const result = await p;
    console.log("Received result: ", result.length);
  } catch (reason) {
    console.error(`Error occured: ${reason.stack}`);
  }
}

async function warm() {
  console.time("answer time@warm");
  for (let i = 0; i < 3; i++) {
    await loop();
  }
  console.timeEnd("answer time@warm");
}

async function runOnce() {
  console.time("answer time@runOnce-1");
  await loop();
  console.timeEnd("answer time@runOnce-1");
}

(async function run() {
  await warm();
  console.time("answer time@run");
  for (let i = 0; i < 100000000; i++) {
    await runOnce();
  }
  console.timeEnd("answer time@run");
})();
