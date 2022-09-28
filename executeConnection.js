const executeConnection = async (
  connection,
  followContents,
  dbResultMap,
  history
) => {
  while (followContents.length > 0) {
    const followContent = followContents.shift();

    if (history[followContent]) {
      dbResultMap[followContent] = history[followContent].content;
      // console.log("use history data - ", followContent);
      continue;
    }

    const [rows] = await connection.execute(
      `
          SELECT tech_term FROM Terms 
            WHERE CHAR_LENGTH(tech_term) >= 2 AND INSTR(?, tech_term) = 1
            GROUP BY tech_term
            ORDER BY CHAR_LENGTH(tech_term) DESC
            LIMIT 1`,
      [followContent]
    );

    const content = rows[0]?.tech_term || null;

    if (content) {
      history[followContent] = {
        content,
        createdAt: new Date(),
      };
    }

    dbResultMap[followContent] = content;
  }
};

module.exports = { executeConnection };
