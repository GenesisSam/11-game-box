const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

// 연결 성공 시
socket.on("connect", () => {
  console.log("서버에 연결되었습니다!");
});

// 게임 오픈 이벤트 수신
socket.on("gameOpen", (payload) => {
  console.log("새로운 게임이 시작되었습니다:", payload);

  // 테스트용 응답 전송
  const testResponse = {
    gameId: payload.gameId,
    fixtureId: payload.fixtureId,
    userId: "U000001",
    userName: "동현",
    answer: payload.options[Math.floor(Math.random() * payload.options.length)],
  };

  console.log("응답 전송 중...");
  socket.emit("gameResponse", testResponse);

  // 게임 상태 확인
  setTimeout(() => {
    console.log("게임 상태 확인 중...");
    socket.emit("gameStatus", payload.gameId);
  }, 1000);
});

// 게임 상태 응답 수신
socket.on("gameStatusResponse", (stats) => {
  console.log("게임 상태:", stats);
});

// 게임 상태 오류 응답 수신
socket.on("gameStatusError", (error) => {
  console.log("게임 상태 ERROR:", error);
});

// 에러 처리
socket.on("connect_error", (error) => {
  console.error("연결 에러:", error);
});

process.on("SIGINT", () => {
  console.log("\n연결을 종료합니다.");
  socket.disconnect();
  process.exit();
});
