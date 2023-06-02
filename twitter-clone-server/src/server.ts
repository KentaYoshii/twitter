import app, { redisClient } from "./app";
import { createTable, deleteTable } from "./database/db_table";
import "express-session";

declare module "express-session" {
  interface SessionData {
    isAuth: boolean;
    uid: string;
    entityType: string;
    entityValue: string;
  }
}

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  switch (args[i]) {
    case "--c":
      createTable().catch((err) => {
        console.log(err);
      });
      break;
    case "--d":
      deleteTable().catch((err) => {
        console.log(err);
      });
      break;
    default:
      break;
  }
}


const server = app.listen(app.get("port"), () => {
  console.log(
    "App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env"),
  );
});

process.on("SIGTERM", () => {
  server.close(() => {
    redisClient
      .flushDb()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => console.log(e));
  });
});

process.on("SIGQUIT", () => {
  server.close(() => {
    redisClient
      .flushDb()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => console.log(e));
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    redisClient
      .flushDb()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => console.log(e));
  });
});

export default server;
