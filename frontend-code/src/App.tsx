// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Gamepad2, ReceiptText, X } from "lucide-react";
import HomeViewComponent from "./views/HomeView"; // Your real working game
import CreditsView from "./views/CreditsView";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnhancedHomeView />} />
        <Route path="/credits" element={<CreditsView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

const EnhancedHomeView: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const x = "/DDD.gif";

  const InstructionsView = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg border-2 border-gray-600 w-11/12 max-w-2xl text-white font-1 relative flex flex-col items-center">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <X size={32} />
        </button>
        <h2 className="text-4xl mb-6 text-primary">How to Play</h2>
        <div className="text-left space-y-4 text-lg">
          <p><strong className="text-primary">OBJECTIVE:</strong> Dodge the dinosaurs! Survive as long as you can.</p>
          <p><strong className="text-primary">CONTROLS:</strong> Use <kbd className="kbd purple-kbd">W</kbd> <kbd className="kbd purple-kbd">A</kbd> <kbd className="kbd purple-kbd">S</kbd> <kbd className="kbd purple-kbd">D</kbd> to move your character.</p>
          <p><strong className="text-primary">SPRINT:</strong> Hold <kbd className="kbd purple-kbd">SHIFT</kbd> to sprint. This uses your stamina bar.</p>
          <p><strong className="text-primary">STAMINA:</strong> If the stamina bar runs out, you can't sprint. Wait for it to slowly refill.</p>
          <p><strong className="text-primary">LIVES:</strong> You have 3 lives. Getting hit by a dinosaur costs one life.</p>
          <p><strong className="text-primary">GAME OVER:</strong> Lose all 3 lives and the game is over!</p>
        </div>
        <button onClick={onClose} className="btn btn-primary mt-8">
          Got it!
        </button>
      </div>
    </div>
  );

  if (gameOver) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl mb-4">Game Over</h2>
          <button className="btn btn-primary" onClick={() => { setGameOver(false); setHasGameStarted(true); }}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  // -------------------------
  // Main Menu Screen (starts here directly)
  // -------------------------
  if (!hasGameStarted) {
    return (
      <section className="w-full h-full bg-[url('/grid.apng')] bg-cover aspect-auto">
        {showInstructions && <InstructionsView onClose={() => setShowInstructions(false)} />}
        
        <div className="hero h-[90vh] w-full">
          <div className="hero-content flex flex-col gap-4 items-center">
            <img src={x} className="h-40 mx-auto animate-bounce" alt="DDD gif" />
            <div className="mt-10 flex flex-col w-full gap-2">
              <button className="btn animate-bounce btn-primary font-1 text-lg scale-150 my-3" onClick={() => {
                setHasGameStarted(true);
              }}>Play now <Gamepad2 /></button>
              
              <p className="pt-2"> </p>

              <button 
                className="btn btn-outline font-1 text-lg scale-150 my-3"
                onClick={() => setShowInstructions(true)}
              >Instructions<ReceiptText /></button>
              
              <p className="pt-1"> </p>
              
              <Link
                to="/credits"
                className="btn btn-outline font-1 text-lg scale-150 my-3"
              >See credits</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // -------------------------
  // After pressing Play -> full-screen game
  // -------------------------
  return (
    <div className="w-screen h-screen">
      <HomeViewComponent onGameOver={() => setGameOver(true)} />
    </div>
  );
};