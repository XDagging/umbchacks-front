import React, { useState } from "react";
import Game from "../components/Game";
import Marquee from "react-fast-marquee";
import PhoneComponent from "../components/PhoneComponent";

export default function HomeView() {
  const [hasGameStarted, setHasGameStarted] = useState(true);

  return (
    <section className="w-screen h-screen">
      {!hasGameStarted ? (
        <section className="w-full h-full">
          <Marquee className="flex items-center justiy-between">
            <p className="font-1 mr-16">You're probably broke</p>
            <p className="font-1 mr-16">
              Let me guess, you blew your money on something stupid again?
            </p>
            <p className="font-1 mr-16">Womp Womp!</p>
            <p className="font-1 mr-16">Cry about it</p>
          </Marquee>
        </section>
      ) : (
        <div className="grid grid-cols-6 items-start justify-start w-screen h-full">
          <div className="col-span-4 w-full h-full">
            <Game />
          </div>

          <div className="col-span-2 w-full h-full relative">
            <PhoneComponent />
          </div>
        </div>
      )}
    </section>
  );
}
