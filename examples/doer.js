import * as maxwell from "../src";

let client = new maxwell.Client(["localhost:1443"], {
  sslEnabled: true,
  debugRoundEnabled: true,
});
let doer = client.getDoer();

(function loop() {
  let p = doer.do({ type: "get_candles", value: {} }, { sourceEnabled: true });

  p.then((result) => {
    console.log(`Received result: ${result}`);
    setTimeout(loop, 1000);
  }).catch((reason) => {
    console.error(`Error occured: ${reason.stack}`);
    setTimeout(loop, 1000);
  });
})();
