require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  await server.register(Jwt);
  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    verify: { aud: false, iss: false, sub: false },
    validate: (artifacts) => ({ isValid: true, credentials: artifacts.decoded.payload }),
  });
  server.auth.default("jwt");

  server.route(require("./routes/auth"));
  server.route(require("./routes/leaves"));

  await server.start();
  console.log("Server running on", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
