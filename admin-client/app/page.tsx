"use client";

import React from "react";
import SocketProvider, {
  useSocketCtx,
} from "./components/adminSocketConnector";
import styled from "styled-components";
import GameContextProvider, { useGameCtx } from "./components/gameProvider";
import { FilePlus2, X } from "lucide-react";
import { Portal } from "@ark-ui/react/portal";
import { Dialog } from "@ark-ui/react/dialog";

const Container = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  flex: 1;
  min-height: 0;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
  }
`;

const GameCardContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 20px;
  height: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButtonContainer = styled.div`
  position: absolute;
  border-bottom: 1px solid #dfdfdf;
  top: 0;
  right: 0;
  left: 0;
  text-align: end;
  padding: 0 12px;
`;

const GameCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding-top: 32px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 100%;
  overflow: hidden;

  > .list {
    padding: 0 20px 20px;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    height: inherit;
  }
`;

const GameCell = styled.div`
  width: 100%;
  padding: 8px;
  color: #010505;

  & + & {
    margin-top: 8px;
    border-top: 1px solid #ddd;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  > span {
    display: block;
    width: 100%;
  }

  & + & {
    margin-top: 16px;
  }
`;

const Input = styled.input`
  color: black;
  background-color: transparent;
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const Textarea = styled.textarea`
  color: black;
  background-color: transparent;
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

function HomeInstance() {
  const { makeGame } = useSocketCtx();
  const { games, responses } = useGameCtx();
  const [isOpen, setOpen] = React.useState(false);
  const [selectedGameId, setSelectGameId] = React.useState<
    string | undefined
  >();
  const gameResponse = selectedGameId ? responses[selectedGameId] : [];

  return (
    <>
      <Container>
        <GameCardContainer>
          <GameCard>
            <ActionButtonContainer>
              <button onClick={() => setOpen(true)} title="게임 생성">
                <FilePlus2 size={24} color="#010105" />
              </button>
            </ActionButtonContainer>

            <div className="list">
              {Object.entries(games).map(([gameId, game], index) => (
                <GameCell
                  key={`${gameId}_${index}`}
                  role="button"
                  onClick={() => {
                    setSelectGameId(gameId);
                  }}
                >
                  <h3>#{gameId.toUpperCase()}</h3>
                  <p>
                    <strong>타입:</strong> {game.type}
                    <br />
                    <strong>콘텐츠:</strong> <span> {game.content}</span>
                    <br />
                    <strong>응답 제한 시간:</strong> {game.timeout}s
                    <br />
                    <strong>선택지:</strong> [{game.options}]
                  </p>
                </GameCell>
              ))}
            </div>
          </GameCard>

          <GameCard>
            <div className="list">
              {gameResponse.map((response, index) => (
                <GameCell key={index}>
                  <div>
                    {response.userName}({response.userId}) 님이 선택한 옵션:{" "}
                    {response.answer}{" "}
                    <small>(기록시간:{response.timestamp})</small>
                  </div>
                </GameCell>
              ))}
            </div>
          </GameCard>
        </GameCardContainer>
      </Container>

      <Dialog.Root open={isOpen} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />
          <Dialog.Positioner
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Dialog.Content
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "520px",
                height: "530px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                padding: "24px",
                color: "#010105",
              }}
            >
              <Dialog.Title>게임 생성</Dialog.Title>
              <Dialog.Description>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const form = new FormData(e.currentTarget);
                    const options = form.get("options") as string;
                    if (!options) {
                      alert("옵션은 1개 이상이어야 합니다.");
                      return;
                    }
                    if (
                      options.split(",").length < 2 &&
                      form.get("type") !== "vote"
                    ) {
                      alert("옵션은 2개 이상이어야 합니다.");
                      return;
                    }

                    makeGame({
                      gameId: (form.get("gameId") as string)
                        .trim()
                        .toUpperCase(),
                      type: form.get("type") as string,
                      content: (form.get("content") as string) ?? "",
                      timeout: parseInt(
                        (form.get("timeout") as string) ?? "30"
                      ),
                      options: options
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean)
                        .join(","),
                    } as never);
                    e.currentTarget.reset();
                    setOpen(false);
                  }}
                >
                  <Label>
                    <span>게임 ID</span>
                    <Input
                      type="text"
                      name="gameId"
                      placeholder="되도록 중첩을 피해주세요."
                      required
                      autoFocus
                      style={{ textTransform: "uppercase" }}
                    />
                  </Label>

                  <Label>
                    <span>게임 Type</span>
                    <label>
                      <input type="radio" name="type" value="poll-single" />{" "}
                      단일 옵션 선택
                    </label>
                    <label>
                      <input type="radio" name="type" value="poll-multiple" />{" "}
                      복구 옵션 선택
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="vote"
                        defaultChecked
                      />{" "}
                      2지선다 투표
                    </label>
                  </Label>

                  <Label>
                    <span>전달 내용</span>
                    <Textarea
                      name="content"
                      rows={4}
                      placeholder="되도록 빈칸상태가 되지 않게 해주세요."
                    />
                  </Label>

                  <Label>
                    <span>응답제한 시간(초)</span>
                    <Input
                      type="number"
                      name="timeout"
                      defaultValue={60}
                      min={1}
                      required
                    />
                  </Label>

                  <Label>
                    <span>옵션</span>
                    <Input
                      type="text"
                      name="options"
                      placeholder=",(콤마)로 다중 옵션을 표현할 수 있습니다."
                      required
                    />
                  </Label>

                  <div>
                    <button
                      style={{ color: "black", fontSize: "16px" }}
                      type="submit"
                    >
                      생성하기
                    </button>
                  </div>
                </form>
              </Dialog.Description>
              <Dialog.CloseTrigger
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                }}
              >
                <X size={24} color="#010105" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

export default function Home(props) {
  return (
    <SocketProvider>
      <GameContextProvider>
        <HomeInstance {...props} />
      </GameContextProvider>
    </SocketProvider>
  );
}
