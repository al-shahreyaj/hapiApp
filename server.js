require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require('@hapi/inert');

const routes = require("./routes");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  await server.register(Jwt);
  await server.register(Inert);

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    verify: { aud: false, iss: false, sub: false },
    validate: (artifacts) => ({ isValid: true, credentials: artifacts.decoded.payload }),
  });

  server.auth.default("jwt");

  server.route(routes);

  await server.start();
  console.log("Server running on", server.info.uri);

  return server;
};


module.exports = init;

if (require.main === module) {
  init()
}