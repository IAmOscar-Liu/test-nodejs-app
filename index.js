const express = require("express");
const mysql = require("mysql2");
const { executeConnection } = require("./executeConnection");
require("dotenv").config();

const history = {};

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

const promisePool = pool.promise();

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("<h1>Hello World</h1>"));

app.get("/api/mysql", async (req, res) => {
  const followContents = req.body.followContents;

  if (!Array.isArray(followContents)) {
    return res.status(400).json({ message: "Incorrect request data" });
  }

  const dbResultMap = {};

  for (let i = followContents.length - 1; i >= 0; i--) {
    if (history[followContents[i]]) {
      dbResultMap[followContents[i]] = history[followContents[i]].content;
      // console.log("use history data - ", followContents[i]);
      followContents.splice(i, 1);
    }
  }

  if (followContents.length === 0) {
    return res.json({ dbResultMap });
  }

  try {
    await Promise.all([
      executeConnection(promisePool, followContents, dbResultMap, history),
      executeConnection(promisePool, followContents, dbResultMap, history),
      executeConnection(promisePool, followContents, dbResultMap, history),
    ]);

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
