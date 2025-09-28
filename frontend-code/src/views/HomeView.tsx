// src/views/HomeView.tsx
import React, { useState } from "react";
import Game from "../components/Game";
import Marquee from "react-fast-marquee";

import PhoneComponent from "../components/PhoneComponent";
import GameOverScreen from "../components/GameOverScreen";
import x from "../../public/DDD.gif";

import { Gamepad2, ReceiptText } from "lucide-react";
import PhoneComponentWithMCQ from "../components/Question";

type HomeViewProps = {
  onGameOver: () => void;
};

export default function HomeView(props: HomeViewProps) {
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [pausedText, setPausedText] = useState("");
  const [sendQuestion, setSendQuestion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0); // forces Game remount on restart

  const handleRestart = () => {
    // hide game-over, remount the Game component
    setGameOver(false);
    setRunId((r) => r + 1);
    setHasGameStarted(true);
  };

  if (gameOver) {
    return <GameOverScreen onRestart={handleRestart} />;
  }

  return (
    <section className="w-screen h-screen">
      {!hasGameStarted ? (
        <section className="w-full h-full bg-[url('/grid.apng')] bg-cover aspect-auto">
          <Marquee
            className="relative z-10 flex items-center justify-between py-2 text-lg"
            gradient={false}
            pauseOnHover={false}
          >
            <p className="font-1 mr-16">You're probably broke</p>
            <p className="font-1 mr-16">
              Let me guess, you blew your money on something stupid again?
            </p>
            <p className="font-1 mr-16">Womp Womp!</p>
            <p className="font-1 mr-16">Cry about it</p>
          </Marquee>

          <div className="hero h-[90vh] w-full">
            <div className="hero-content flex flex-col gap-4 items-center">
              <img src={x} className="h-40 mx-auto animate-bounce"></img>
              <div className="mt-10 flex flex-col w-full gap-2">
                <button
                  className="btn animate-bounce btn-primary font-1 text-lg scale-150 my-3"
                  onClick={() => {
                    setHasGameStarted(true);
                  }}
                >
                  Play now <Gamepad2 />
                </button>
                <button className="btn btn-outline font-1 text-lg scale-150 my-3">
                  Instructions
                  <ReceiptText />
                </button>
                <p className="text-center font-1 text-2xl">or</p>
                <button className="btn btn-outline font-1 text-lg scale-150 my-3">
                  See credits
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-6 items-start justify-start w-screen h-full">
          <div className="col-span-4 w-full h-full">
            {/* Pass onGameOver; key forces a fresh Kaplay instance on restart */}
            <Game
              pausedText={pausedText}
              triggerQuestion={() => {
                setSendQuestion((prev) => prev + 1);
              }}
              key={runId}
              onGameOver={() => setGameOver(true)}
            />
          </div>

          <div className="col-span-2 w-full h-full relative">
            <PhoneComponentWithMCQ
              setPausedText={setPausedText}
              x={sendQuestion}
            />
          </div>
        </div>
      )}
    </section>
  );
}
