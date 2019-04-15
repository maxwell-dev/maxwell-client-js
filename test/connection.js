const protocol = require("maxwell-protocol");
const Connection = require("../src/Connection.js");
const {initOptions} = require("./utils");

let connection = new Connection("ws://localhost:10000", initOptions());
setTimeout(() => {
  let req = protocol.auth_req_t.create({token: "hello"});
  let promise = connection.send(req);
  console.log(promise);
  promise
      .then(result => console.log(result))
      .catch(error => console.log(error));
}, 1000);
