import React, {useRef, useEffect} from "react";
import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import x from "../assets/cloud.png"


export default function Game() {


    const SPEED = 50;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    console.log("canvas ref was ran", canvasRef)
    
    useEffect(() => {
        
        const k = kaplay({
            plugins: [crew],
            font: "happy",
        });

        k.loadCrew("sprite", "apple");
        k.loadCrew("sprite", "grape", "purplefruit");
        k.loadCrew("font", "happy");

        
        const mainCharacter = k.add([
            k.sprite("apple"),
            k.pos(100,100),
            k.anchor("center")
        ])
        
        
        // k.add([
        //     k.pos(40, 40),
        //     k.text("ohhi"),
        // ]);
        // k.add([
        //     // k.sprite("bean"),
        //     k.pos(k.width() / 2, k.height() / 2),
        //     k.anchor("center"),
        // ]);

        // Replace "jump" with the correct button constant or enum from kaplay, e.g., k.KEY_SPACE or similar.
        // If kaplay exports a list of valid button names, use one of those instead of a string literal.
        k.onKeyDown("w", () => {

            mainCharacter.move(0, -SPEED);
            
            console.log("hello world");
        })
        
        k.onKeyDown("a", () => {

            mainCharacter.move(-SPEED,0);
            
            console.log("hello world");
        })
              k.onKeyDown("s", () => {

            mainCharacter.move(0, SPEED);
            
            console.log("hello world");
        })
        
        k.onKeyDown("d", () => {

            mainCharacter.move(SPEED,0);
            
            console.log("hello world");
        })
        

    // FIX: Poll to check if the Kaplay script has loaded and attached itself to the window.
    // This prevents a race condition where the React component mounts before the script is ready.

    // This is the cleanup function for the useEffect hook.
    // It's called when the component unmounts.
    return () => {
        
        // Clear the interval in case the component unmounts before Kaplay loads.

        // If the Kaplay instance was created, destroy it to free up resources.
    };

  }, []);



    return (
        <>
        <p>asdfas</p>

        <canvas ref={canvasRef} className="w-full h-full"></canvas>




        
        </>







    )


}