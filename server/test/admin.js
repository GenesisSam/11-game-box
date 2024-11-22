const { io } = require("socket.io-client");
const inquirer = require("inquirer").default;

const socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("서버에 연결되었습니다!");
});

const promptCommand = () => {
  handleOpenGame();
};

const handleOpenGame = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "gameId",
      message: "게임 ID를 입력하세요:",
    },
    {
      type: "input",
      name: "type",
      message: `게임 타입을 입력하세요\n(1: "poll-single", 2: "poll-multiple", 3: "vote"(default))`,
    },
    {
      type: "input",
      name: "content",
      message: "게임 내용을 입력하세요:",
    },
    {
      type: "input",
      name: "options",
      message: "옵션을 쉼표로 구분하여 입력하세요:",
    },
  ]);

  const type = (function (type) {
    switch (type) {
      case "1":
        return "poll-single";
      case "2":
        return "poll-multiple";
      default:
      case "3":
        return "vote";
    }
  })(answers.type);

  const opts = answers.options.split(",").map((option) => option.trim());
  if (type === "vote" && opts.length < 2) {
    console.log("Vote type 게임은 최소 2개의 옵션이 필요합니다.");
    promptCommand();
    return;
  } else if (opts.length === 0) {
    console.log("게임은 최소 1개이상 옵션이 필요합니다.");
    promptCommand();
    return;
  }

  const testGame = {
    gameId: answers.gameId,
    fixtureId: "4506542",
    type,
    content: answers.content,
    timeout: 60,
    options: opts,
  };

  // 게임 생성 테스트
  console.log("게임 생성 중...");
  socket.emit("gameOpen", testGame);
  console.log("clear");

  promptCommand();
};

promptCommand();
