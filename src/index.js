const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: "development",
});

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
  append: fs.existsSync("openedGames.csv"),
  writeHeaders: !fs.existsSync("openedGames.csv"),
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
  append: fs.existsSync("userResponse.csv"),
  writeHeaders: !fs.existsSync("userResponse.csv"),
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

io.on("connection", (socket) => {
  socket.on("gameOpen", async (payload) => {
    const game = {
      ...payload,
      options: payload.options ? JSON.stringify(payload.options) : undefined,
    };

    await openedGamesCsvWriter.writeRecords([game]);
    io.emit("gameOpen", payload);
  });

  socket.on("gameResponse", async (response) => {
    await userResponseCsvWriter.writeRecords([response]);
  });

  socket.on("gameStatus", async (gameId) => {
    try {
      // 1. Get game object from openedGames.csv
      const games = await readCsvFile("openedGames.csv");
      const gameObject = games.find((game) => game.gameId === gameId);

      if (!gameObject) {
        throw new Error("Game not found");
      }

      // 2. Validate game type
      const validTypes = ["vote", "poll-single", "poll-multiple"];
      if (!validTypes.includes(gameObject.type)) {
        throw new Error("Invalid game type");
      }

      // 3. Collect and analyze responses
      const responses = await readCsvFile("userResponse.csv");
      const gameResponses = responses.filter(
        (response) => response.gameId === gameId
      );

      const stats = {
        gameId,
        totalResponses: gameResponses.length,
        uniqueUsers: new Set(gameResponses.map((r) => r.userId)).size,
        optionCounts: {},
      };

      // Parse options if they exist
      const options = gameObject.options ? JSON.parse(gameObject.options) : [];

      // Calculate option statistics
      gameResponses.forEach((response) => {
        const answer = response.answer;
        stats.optionCounts[answer] = (stats.optionCounts[answer] || 0) + 1;
      });

      socket.emit("gameStatusResponse", stats);
    } catch (error) {
      socket.emit("gameStatusError", { error: error.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
