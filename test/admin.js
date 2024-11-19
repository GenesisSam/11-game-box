const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

// 테스트용 게임 데이터
const testGame = {
  gameId: "game_" + Date.now(),
  fixtureId: "fixture_123",
  type: "poll-multiple",
  content: "가장 좋아하는 프로그래밍 언어는?333333",
  timeout: 60,
  options: ["JavaScript", "Python", "Java", "C++"],
};

// 연결 성공 시
socket.on("connect", () => {
  console.log("서버에 연결되었습니다!");

  // 게임 생성 테스트
  console.log("게임 생성 중...");
  socket.emit("gameOpen", testGame);

  // 소켓 연결 종료
  console.log("소켓 연결을 종료합니다.");
  socket.disconnect();
});
