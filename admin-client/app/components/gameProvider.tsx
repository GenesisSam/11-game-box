import React from "react";
import { useSocketCtx } from "./adminSocketConnector";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface IState {
  games: Record<string, any>;
  responses: Record<string, any>;
}

const GameContext = React.createContext<IState>({
  games: {},
  responses: {},
});

const fixtureId = "4506482";
let timerId: NodeJS.Timeout | undefined;
let didInit = false;

export const useGameCtx = () => React.useContext(GameContext);
export default function GameContextProvider({
  children,
}: React.PropsWithChildren) {
  const { socket } = useSocketCtx();
  const [games, setGames] = React.useState<Record<string, any>>({});
  const [responses, setResponses] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (socket && !didInit) {
      didInit = true;
      socket.on("gameOpenResponse", (payload) => {
        console.log(">>>>>gameOpen", payload);
      });
      socket.on("gameListResponse", (payload) => {
        console.log(">>>>>gameListResponse", payload);
        setGames((prev) => {
          return {
            ...prev,
            ...payload.reduce((acc: Record<string, any>, game: any) => {
              acc[game.gameId] = game;
              return acc;
            }, {}),
          };
        });
      });
      socket.on("responseListResponse", (payload) => {
        console.log(">>>>>responseListResponse", payload);
        setResponses((prev) => {
          return {
            ...prev,
            ...payload.reduce((acc: Record<string, any>, game: any) => {
              if (!acc[game.gameId]) {
                acc[game.gameId] = [];
              }
              acc[game.gameId].push(game);
              return acc;
            }, {}),
          };
        });
      });
      socket.on("gameStatusResponse", (payload) => {
        console.log(">>>>>gameStatusResponse", payload);
      });
      socket.on("gameStatusError", (payload) => {
        console.log(">>>>>gameStatusError", payload);
      });

      socket.emit("requestGameList");

      timerId = setInterval(() => {
        socket.emit("requestResponseList");
      }, 1000);
      return () => {
        clearInterval(timerId);
        socket.disconnect();
      };
    }
  }, [socket]);

  return (
    <GameContext.Provider value={{ games, responses }}>
      {children}
    </GameContext.Provider>
  );
}
