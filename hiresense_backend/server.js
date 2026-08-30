import app from "./app.js";
import env from "./config/env.js";
import { connectMySQL, closeMySQL } from "./config/mysql.js";
import { connectMongo, closeMongo } from "./config/mongo.js";
import "./middleware/passport.js";
import "./middleware/githubPassport.js";

let server;

async function startServer() {
  try {
    await connectMySQL();
    await connectMongo();

    server = app.listen(env.port, () => {
      console.log(
        `HireSense AI API running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      try {
        await closeMySQL();
        await closeMongo();
        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();