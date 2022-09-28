const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("<h1>Hello World</h1>"));

app.get("/api/mysql", async (req, res) => {
  const followContents = req.body.followContents;

  if (!Array.isArray(followContents)) {
    return res.statusCode(400).json({ message: "Incorrect request data" });
  }

  const connection = await mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
  });

  const dbResultMap = {};

  await Promise.all([
    executeConnection(connection, followContents, dbResultMap),
    executeConnection(connection, followContents, dbResultMap),
    executeConnection(connection, followContents, dbResultMap),
  ]);

  connection.destroy();

  res.json({ dbResultMap });
});

app.listen(3000, () => console.log("Server running on port 3000"));

async function executeConnection(connection, followContents, dbResultMap) {
  while (followContents.length > 0) {
    const followContent = followContents.shift();

    const [rows] = await connection.execute(
      `
        SELECT tech_term FROM Terms 
          WHERE CHAR_LENGTH(tech_term) >= 2 AND INSTR(?, tech_term) = 1
          GROUP BY tech_term
          ORDER BY CHAR_LENGTH(tech_term) DESC
          LIMIT 1`,
      [followContent]
    );

    dbResultMap[followContent] = rows[0]?.tech_term || null;
  }
}

/*
const connection = await mysql.createConnection({
    user: "root",
    password: "tipo100501203",
    host: "143.198.179.88",
    port: 3306,
    database: "tipodb",
  });


  const [rows] = await connection.execute(
    `
    SELECT tech_term FROM Terms 
      WHERE CHAR_LENGTH(tech_term) >= 2 AND INSTR(?, tech_term) = 1
      GROUP BY tech_term
      ORDER BY CHAR_LENGTH(tech_term) DESC
      LIMIT 5`,
    ["金屬絲之間的空隙，以及"]
  )
*/
