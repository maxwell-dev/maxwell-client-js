import * as maxwell from "../src";

let client =  maxwell.Client.singleton(["jx003.aijiaoyi.xyz:1443"], {
  sslEnabled: true,
  roundDebugEnabled: false,
});

async function loop() {
  try {
    let p = client.request("/hello",  {"content": "world"}, { sourceEnabled: true });
    const result = await p;
    console.log(`Received result: `, result);
  } catch (reason) {
    console.error(`Error occured: ${reason.stack}`);
  }
};

async function warm() {
  console.time("answer time@warm");
  for (let i = 0; i < 3; i++) {
    await loop();
  }
  console.timeEnd("answer time@warm");
};

async function runOnce() {
  console.time("answer time@runOnce-1");
  await loop();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.timeEnd("answer time@runOnce-1");

  // console.time("answer time@runOnce-n");
  // await Promise.all([loop(), loop(), loop(), loop(), loop()]);
  // console.timeEnd("answer time@runOnce-n");
}


(async function run() {
  await warm()
  console.time("answer time@run");
  for (let i = 0; i < 100000000; i++) {
    await runOnce();
  }
  console.timeEnd("answer time@run");
})()
