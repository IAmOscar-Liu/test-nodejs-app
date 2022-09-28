const express = require("express");
const mysql = require("mysql2/promise");
const { executeConnection } = require("./executeConnection");
require("dotenv").config();

const history = {};

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("<h1>Hello World</h1>"));

app.get("/api/mysql", async (req, res) => {
  const followContents = req.body.followContents;

  if (!Array.isArray(followContents)) {
    return res.status(400).json({ message: "Incorrect request data" });
  }

  try {
    const connection = await mysql.createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    });

    const dbResultMap = {};

    await Promise.all([
      executeConnection(connection, followContents, dbResultMap, history),
      executeConnection(connection, followContents, dbResultMap, history),
      executeConnection(connection, followContents, dbResultMap, history),
    ]);

    await connection.end();

    // if history has more than 1000 items, delete the earliest items
    if (Object.keys(history).length > 1000) {
      // console.log("history over limit - ", history);

      const keySortedByDate = Object.keys(history)
        .map((key) => ({
          key,
          createdAt: history[key].createdAt,
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((el) => el.key);

      const deletedKeys = keySortedByDate.slice(0, -1000);

      for (let delKey of deletedKeys) {
        delete history[delKey];
      }
      // console.log("history back to limit - ", history);
    }
    res.json({ dbResultMap });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/history", (_, res) => {
  for (let key in history) {
    delete history[key];
  }
  res.send({ message: "history has been deleted" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
