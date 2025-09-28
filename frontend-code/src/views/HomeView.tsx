// src/views/HomeView.tsx
import React, { useState } from "react";
import Game from "../components/Game";
import Marquee from "react-fast-marquee";
import PhoneComponent from "../components/PhoneComponent";
import GameOverScreen from "../components/GameOverScreen";
import PhoneComponentWithMCQ from "../components/Question";

interface HomeViewProps {
  onGameOver: () => void;
}

export default function HomeView({ onGameOver }: HomeViewProps) {
  const [gameText, setGameText] = useState("");
  const [sendQuestion, setSendQuestion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0); // forces Game remount on restart

  const handleRestart = () => {
    // hide game-over, remount the Game component
    setGameOver(false);
    setRunId((r) => r + 1);
  };

  if (gameOver) {
    return <GameOverScreen onRestart={handleRestart} />;
  }

  // Game is always started when this component renders
  // The menu is now handled in App.tsx
  return (
    <section className="w-screen h-screen">
      <div className="grid grid-cols-6 items-start justify-start w-screen h-full">
        <div className="col-span-4 w-full h-full">
          {/* Pass onGameOver; key forces a fresh Kaplay instance on restart */}
          <Game 
            triggerQuestion={() => {
              setSendQuestion((prev) => prev + 1);
            }} 
            key={runId} 
            onGameOver={onGameOver}
          />
        </div>

        <div className="col-span-2 w-full h-full relative">
          <PhoneComponentWithMCQ x={sendQuestion} />
        </div>
      </div>
    </section>
  );
}