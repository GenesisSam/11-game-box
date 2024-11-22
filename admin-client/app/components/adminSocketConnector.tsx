import React from "react";
import { io, Socket } from "socket.io-client";

interface IGameCreatePayload {
  gameId: string;
  type: "poll-single" | "poll-multiple" | "vote";
  content: string;
  timeout: number;
  options: string[];
  fixtureId?: string;
}

interface IState {
  socket: Socket | null;
  makeGame: (payload: IGameCreatePayload) => void;
}

let initDid = false;

const SocketContext = React.createContext<IState>({
  socket: null,
  makeGame: () => {},
});

export default function SocketProvider(props: React.PropsWithChildren) {
  const [socketInst, setInstance] = React.useState<Socket | null>(null);

  const makeGame = React.useCallback(
    (payload: IGameCreatePayload) => {
      if (socketInst) {
        payload.fixtureId = payload.fixtureId ?? "4506482";
        console.log("[Sys] 게임 생성 중...");
        socketInst.emit("gameOpen", payload);
        socketInst.emit("requestGameList");
      }
    },
    [socketInst]
  );

  React.useEffect(() => {
    if (initDid) return;
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      console.log("[Sys] 서버에 연결되었습니다!");
    });
    initDid = true;
    setInstance(socket);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInst,
        makeGame,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
}

export const useSocketCtx = () => React.useContext(SocketContext);