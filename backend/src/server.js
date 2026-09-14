require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT || 4445);

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`NXTGENSEC CTF API running at http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
  console.error("HTTP server error:", error);
});

setInterval(() => {
  // Keep the development process alive.
}, 30_000);