import * as maxwell from "../src";

let client = new maxwell.Client(["localhost:8081"], {
  sslEnabled: false,
  debugRoundEnabled: true,
});
let doer = client.getDoer();

(function loop() {
  let p = doer.do({ type: "/v7/market/candle/get_candles_until_now", value: {
    "symbol": "XSHE:000001",
    "timeframe": "1d",
    "limit": 1000,
    "token": "0b44e06f099f2b92117d383b54431b1c",
    "price_adjusting_type": "none",
    "vol_adjusting_type": "none"
} }, { sourceEnabled: true });

  p.then((result) => {
    console.log(`Received result: ${result}`);
    setTimeout(loop, 1000);
  }).catch((reason) => {
    console.error(`Error occured: ${reason.stack}`);
    setTimeout(loop, 1000);
  });
})();
