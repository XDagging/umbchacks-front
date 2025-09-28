import React, { useEffect } from "react";

interface GameOverScreenProps {
  onRestart: () => void;
}

export default function GameOverScreen({ onRestart }: GameOverScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRestart();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Menacing red geometric shapes */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-900 transform rotate-45"></div>
        <div className="absolute top-20 right-10 w-16 h-16 bg-red-800 transform rotate-12"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-red-900 transform -rotate-12"></div>
        <div className="absolute bottom-10 right-32 w-20 h-20 bg-red-800 transform rotate-45"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-red-900"></div>
        <div className="absolute top-32 right-1/3 w-28 h-28 bg-red-800 transform -rotate-45"></div>
        <div className="absolute top-1/4 right-1/5 w-20 h-20 bg-red-700 transform rotate-30"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-red-900 transform -rotate-30"></div>
      </div>

      {/* Main content with fade and scale animation */}
      <div className="text-center relative z-10 animate-menacing-entrance">
        {/* Massive GAME OVER text */}
        <div className="relative">
          <h1 className="text-9xl font-black text-red-500 mb-4 transform hover:scale-105 transition-transform duration-200 cursor-default"
              style={{ 
                fontFamily: 'monospace',
                textShadow: '6px 6px 0px #dc2626, 12px 12px 0px #991b1b, 18px 18px 0px #7f1d1d',
                letterSpacing: '0.15em'
              }}>
            GAME
          </h1>
          <h1 className="text-9xl font-black text-red-500 transform hover:scale-105 transition-transform duration-200 cursor-default"
              style={{ 
                fontFamily: 'monospace',
                textShadow: '6px 6px 0px #dc2626, 12px 12px 0px #991b1b, 18px 18px 0px #7f1d1d',
                letterSpacing: '0.15em'
              }}>
            OVER
          </h1>
        </div>
      </div>

      {/* Fade to black overlay */}
      <div className="absolute inset-0 bg-black animate-fade-to-black pointer-events-none"></div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes menacing-entrance {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) translateY(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }

        @keyframes fade-to-black {
          0% {
            opacity: 0;
          }
          85% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        .animate-menacing-entrance {
          animation: menacing-entrance 1s ease-out;
        }

        .animate-fade-to-black {
          animation: fade-to-black 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}