import React, {useRef, useEffect, useState, use} from "react";
import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import x from "../assets/cloud.png"


export default function Game() {

    const hasGameStarted = useRef<any>(null);
    // const [x, setX] = useState(false);
    const [playerStats, setPlayerStats] = useState({
        age: 0,
        health: 100,
        money: 0,
        description: "A new player",


    })

    const SPEED = 200;
    // const canvasRef = useRef<HTMLCanvasElement>(null);

    // console.log("canvas ref was ran", canvasRef)
    
    useEffect(() => {

        if (hasGameStarted.current) return;
        
        const k = kaplay({
            
            plugins: [crew],
            font: "happy",
            background: [0,0,0],
            backgroundAudio: true,
            
            width: Math.floor(window.innerWidth/6)*4,
            height: window.innerHeight,
        });

        hasGameStarted.current = k;;
        hasGameStarted.current.canvas.style.position = 'absolute';
        hasGameStarted.current.canvas.style.top = '0px';
        hasGameStarted.current.canvas.style.left = '0px';
        k.loadCrew("sprite", "apple");
        k.loadCrew("sprite", "grape", "purplefruit");
        k.loadCrew("font", "happy");

    
        // const gameBar = k.add([
        //     k.rect(k.width(), 50).colo,
        //     k.pos(0, k.height() - 50),
        //     k.anchor("topleft"),
        //     k.fixed()
        // ])
        const BAR_HEIGHT = 100;
        const MARGIN = 50; // Our desired margin in pixels

k.add([
    k.rect(k.width() - (MARGIN * 2), BAR_HEIGHT),

    // Adjust the position for left and bottom margins
    k.pos(MARGIN, k.height() - BAR_HEIGHT - MARGIN),
    
    k.fixed(), // This is the magic part!
    k.color(50, 50, 50), // A dark gray color
]);

k.add([
    k.text("Age: 412", { size: 24 }),
    k.pos(MARGIN + 20, k.height() - BAR_HEIGHT - MARGIN + 20),
    k.color(255, 255, 255), // White text
    k.fixed(), // Ensure the text is also fixed
])



        
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
        {/* <canvas ref={canvasRef} className=""></canvas> */}




        
        </>







    )


}