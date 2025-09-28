// src/views/HomeView.tsx
import React, { useEffect, useState } from "react";
import Game from "../components/Game";
import Marquee from "react-fast-marquee";

import PhoneComponent from "../components/PhoneComponent";
import GameOverScreen from "../components/GameOverScreen";
import x from "../../public/DDD.gif";

import { Gamepad2, ReceiptText } from "lucide-react";
import PhoneComponentWithMCQ from "../components/Question";

type HomeViewProps = {
  onGameOver: () => void;
}

export default function HomeView(props: HomeViewProps) {
  const [pausedText, setPausedText] = useState("");
  const [sendQuestion, setSendQuestion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [canUnpause, setCanUnpause] = useState(false);
  const [roundIncreaseTrigger, setRoundIncreaseTrigger] = useState(0); // bump when wrong answer
  const [runId, setRunId] = useState(0); // forces Game remount on restart

  useEffect(() => {
    setTimeout(() => {
      setPausedText("");
    }, 5000)
  }, [pausedText])

  useEffect(() => {
    if (answered) {
      console.log("this was called chats")
      setTimeout(() => {
        setAnswered(false);
      }, 5000)
    }
  }, [answered])

  const handleRestart = () => {
    // hide game-over, remount the Game component
    setGameOver(false);
    setRunId((r) => r + 1);
  };

  if (gameOver) {
    return <GameOverScreen onRestart={handleRestart} />;
  }

  // Removed the old main menu - now this component only handles the actual game
  return (
    <section className="w-screen h-screen">
      <div className="grid grid-cols-6 items-start justify-start w-screen h-full">
        <div className="col-span-4 w-full h-full">
          {/* Pass onGameOver; key forces a fresh Kaplay instance on restart */}
          <Game 
            hasAnswered={answered}
            pausedText={pausedText}
            triggerQuestion={() => {
              setSendQuestion((prev) => prev + 1);
            }}
            // pass a trigger so Game can increment round on wrong answers
            roundIncreaseTrigger={roundIncreaseTrigger}
            key={runId}
            onGameOver={() => setGameOver(true)}
          />
        </div>

        <div className="col-span-2 w-full h-full relative">
          <PhoneComponentWithMCQ
            setAnswered={setAnswered}
            setPausedText={setPausedText}
            x={sendQuestion}
            onAnswered={(correct: boolean) => {
              // mark that the user has answered (phone UI will show feedback)
              setAnswered(true);
              // disallow unpause immediately; allow after delay depending on correctness
              setCanUnpause(false);
              const delay = correct ? 3000 : 5000;
              // If incorrect, bump trigger so Game can increase in-game round
              if (!correct) setRoundIncreaseTrigger((r) => r + 1);

              // After the delay, clear the paused text, allow unpause, and reset answered state
              setTimeout(() => {
                setPausedText("");
                setCanUnpause(true);
                setAnswered(false);
              }, delay);
            }}
          />
        </div>
      </div>
    </section>
  );
}