const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const csv = require("csv-parser");

const openedGamesCsvWriter = createObjectCsvWriter({
  path: "openedGames.csv",
  header: [
    { id: "gameId", title: "gameId" },
    { id: "fixtureId", title: "fixtureId" },
    { id: "type", title: "type" },
    { id: "content", title: "content" },
    { id: "timeout", title: "timeout" },
    { id: "options", title: "options" },
  ],
  append: true,
});

const userResponseCsvWriter = createObjectCsvWriter({
  path: "userResponse.csv",
  header: [
    { id: "gameId", title: "gameId" },
    { id: "fixtureId", title: "fixtureId" },
    { id: "userId", title: "userId" },
    { id: "userName", title: "userName" },
    { id: "answer", title: "answer" },
  ],
  append: true,
  writeHeaders: true,
});

const readCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

(async () => {
  await openedGamesCsvWriter.writeRecords([
    {
      gameId: "G0001",
      fixtureId: "4506542",
      type: "vote",
      content: "hi~!",
      timeout: 60,
      options: ["1", "2", "3"],
    },
  ]);

  // 1. Get game object from openedGames.csv
  const games = await readCsvFile("openedGames.csv");
  console.log(">>>>", games);
  const gameObject = games.find((game) => game.gameId === "G0001");

  if (!gameObject) {
    throw new Error("Game not found");
  }
})();
