// src/components/Game.tsx
import React, { useRef, useEffect, useState } from "react";
import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import { HeartCrack } from "lucide-react";

// import x from "../assets/grass.png";



const aka = [
  "Hello, welcome to the demonstration.",
  "This is a typewriter effect in React.",
  "It reveals text one character at a time.",
  "Isn't it neat?"
];
let interval: any
export default function Game() {
    const staminaBarRef = useRef<any>(null);
  const hasGameStarted = useRef<any>(null);
  const [dialogueState, setDialogueState] = useState(-1);
  const dialogueTextRef = useRef<any>(null);

  const allEnemies = useRef<any[]>([]);
  const playerState = useRef({
    xCoord: 0,
    yCoord: 0,
    stamina: 5000,
    runningSpeed: 1.0,
    health: 3,
    money: 3,


      isSpeedBoosted: false,
        speedBoostTimer: 0,
        isInvincible: false,
        opacity: 1,
        invincibilityTimer: 0,
  })
  
  const [dialogue, setDialogue] = useState("");

        // The text currently displayed on screen

  useEffect(() => {
    // Make sure there's a dialogue to display
    if (dialogueState < aka.length) {
        console.log(dialogueState)
      const fullDialogue = aka[dialogueState];
      // Reset the displayed dialogue to start typing from scratch
      setDialogue(''); 

      let currentIndex = 0;
      const typingSpeed = 50; // Milliseconds between each character

      // Set up an interval to add one character at a time
      const intervalId = setInterval(() => {
        // If we've typed out the whole string, stop the interval
        if (currentIndex >= fullDialogue.length-1) {
          clearInterval(intervalId);
          return;
        }

        // Use the functional form of setState to get the most recent state
        setDialogue(prevDialogue => prevDialogue + fullDialogue[currentIndex]);
        currentIndex++;
      }, typingSpeed);

      // This is the cleanup function.
      // It runs when the component unmounts or when the effect re-runs.
      return () => {
        clearInterval(intervalId);
      };
    }
    // The effect depends on the current dialogue line (dialogueState)
    // and the source array itself (aka).
  }, [dialogueState, aka]); 

  useEffect(() => {
    // 3. If our Kaboom text object exists...
    if (dialogueTextRef.current) {
      // 4. ...update its .text property with the new dialogue string.
      dialogueTextRef.current.text = dialogue;
    }
  }, [dialogue]);

  // A button to advance to the next line of dialogue
  const handleNext = () => {
    if (dialogueState < aka.length - 1) {
        console.log("this was clicked")
      setDialogueState(prevState => prevState + 1);
    }
  };

//   const [playerStats, setPlayerStats] = useState({
//     age: 0,
//     health: 2,
//     money: 0,
//     description: "A new player",
//   });

  

  useEffect(() => {
    if (hasGameStarted.current) return;

    const k = kaplay({
      plugins: [crew],
      font: "happy",
      background: [0, 0, 0],
      backgroundAudio: true,
      width: Math.floor(window.innerWidth / 6) * 4,
      height: window.innerHeight,
    });
    const GRID = 64; // cell size
 

    
    hasGameStarted.current = k;
    k.canvas.style.position = "absolute";
    k.canvas.style.top = "0px";
    k.canvas.style.left = "0px";

    // Assets
    k.loadCrew("sprite", "heart-o")
    k.loadCrew("sprite", "heart");
    k.loadCrew("sprite", "apple");
    k.loadCrew("sprite", "grape", "purplefruit");
    k.loadCrew("font", "happy");
    k.loadSprite("volatility", "volatility.png");
    k.loadSprite("grass", "grass.png")

    // ----- HUD (fixed to screen space) -----
    const BAR_HEIGHT = 100;
    const MARGIN = 50;

  
    

    // ----- WORLD GEOMETRY -----
    // Screen viewport (camera) size
    const VIEW_W = k.width();
    const VIEW_H = k.height();

    // Margins so the world isn't flush with screen edges, and room for HUD
    const MAP_MARGIN = 32;
    const BORDER_THICK = 6;
    const BORDER_OUTLINE = 3; // outline thickness around borders
    const UI_BOTTOM = BAR_HEIGHT + MARGIN;

    // Base square (the "inner" play square above HUD)
    const baseMaxW = VIEW_W - MAP_MARGIN * 2;
    const baseMaxH = VIEW_H - UI_BOTTOM - MAP_MARGIN;
    const baseSize = Math.min(baseMaxW, baseMaxH);

    // World is 3x side length (=> 9x area)
    const worldSize = baseSize * 3;
    const worldW = worldSize;
    const worldH = worldSize;

    // Place world so its top is MAP_MARGIN below top of screen; center horizontally relative to initial view
    const worldX = Math.floor((VIEW_W - baseSize) / 2) - (worldSize - baseSize) / 2;
    const worldY = MAP_MARGIN - (worldSize - baseSize); // extend upwards so there's plenty of space to scroll

    // Inner playable rect (for grid drawing)
    // const innerX = worldX + BORDER_THICK;
    // const innerY = worldY + BORDER_THICK;
    // const innerW = worldW - BORDER_THICK * 2;
    // const innerH = worldH - BORDER_THICK * 2;

// ----- WORLD GEOMETRY -----

// ... (keep all your size calculation code above)

// --- TEMPORARY DEBUGGING TEST ---
// Comment out your old calculation lines for innerX, innerY, etc.
const innerX = worldX + BORDER_THICK;
const innerY = worldY + BORDER_THICK;
const innerW = worldW - BORDER_THICK * 2;
const innerH = worldH - BORDER_THICK * 2;

// Use these simple values instead to force the world to be visible
// const innerX = 0;
// const innerY = 0;
// const innerW = k.width();
// const innerH = k.height();
// --- END DEBUGGING TEST ---


// World fill (this should now appear)
k.add([
    k.rect(innerW, innerH),
    k.pos(innerX, innerY),
    k.color(20, 40, 60),
]);

// ... your loops for adding grass will now use these new coordinates

    // World fill
    k.add([
      k.rect(innerW, innerH),
      k.pos(innerX, innerY),
      k.color(20, 40, 60),
    ]);

    // ----- GRID AESTHETIC -----
    // Draw light grid lines inside the world
  
    // Vertical lines
    for (let x = innerX + GRID; x < innerX + innerW; x += GRID) {
      k.add([
        k.rect(1, innerH),
        k.pos(Math.floor(x), innerY),
        k.color(70, 90, 110), // subtle
        // If your Kaplay build supports opacity:
        // k.opacity(0.25),
      ]);
    }
    // Horizontal lines
    for (let y = innerY + GRID; y < innerY + innerH; y += GRID) {
      k.add([
        k.rect(innerW, 1),
        k.pos(innerW, Math.floor(y)),
        k.color(70, 90, 110),
        // k.opacity(0.25),
      ]);
    }


    console.log(`DEBUG: Screen Width is ${k.width()}, MARGIN is ${MARGIN}`);
const STAMINA_BAR_WIDTH = 200;
const STAMINA_BAR_HEIGHT = 40;
const staminaBarX = k.width() - MARGIN;
const staminaBarY = MARGIN;

// The Parent: This object is responsible for screen positioning.
const BORDER_THICKNESS = 4; // How thick the border should be

// The Parent: This object is responsible for screen positioning.
const staminaGroup = k.add([
    k.pos(staminaBarX, staminaBarY),
    k.anchor("topright"), 
    k.fixed(),
    k.z(2),
]);

// 1. The Child (Border/Background): Drawn first, so it's in the back.
staminaGroup.add([
    k.rect(STAMINA_BAR_WIDTH, STAMINA_BAR_HEIGHT),
    k.pos(0, 0),
    k.color(0, 0, 0), // Black color for the border
    k.anchor("topright"),
]);

// 2. The Child (Stamina Fill): Drawn on top of the background.
//    It's smaller and inset to create the border effect.
const innerBarMaxWidth = STAMINA_BAR_WIDTH - (BORDER_THICKNESS * 2);
const innerBarHeight = STAMINA_BAR_HEIGHT - (BORDER_THICKNESS * 2);

staminaBarRef.current = staminaGroup.add([
    k.rect(innerBarMaxWidth, innerBarHeight),
    // Offset from the parent's corner by the border thickness
    k.pos(-BORDER_THICKNESS, BORDER_THICKNESS), 
    k.color(0, 255, 0), // Green fill color
    k.anchor("topright"),
]);

// 3. The Child (Stamina Text): Drawn on top of everything else.
staminaGroup.add([
    k.text("Stamina", { size: 24 }),
    k.pos(-STAMINA_BAR_WIDTH / 2, STAMINA_BAR_HEIGHT / 2), 
    k.anchor("center"),
    k.color(255, 255, 255), // White text for better contrast on a black bg
]);
    // Adding tiles

    for (let y = innerY; y < innerY + innerH; y += GRID) {
    for (let x = innerX; x < innerX + innerW; x += GRID) {
        k.add([
            k.sprite("grass"),
            k.pos(x, y),
            // Add a z-index to ensure it's drawn behind the player
            k.z(0), 
            k.scale(GRID/18),
        ]);
    }
}


      k.add([
      k.rect(k.width() - MARGIN * 2, BAR_HEIGHT),
      k.pos(MARGIN, k.height() - BAR_HEIGHT - MARGIN),
      k.fixed(),
      k.color(50, 50, 50),
      k.z(2),
    ]);
    if (dialogueState ===-1) {
        handleNext();
    }


    
    
    const textObj = k.add([
      k.text("", { size: 24 }),
      k.pos(MARGIN + 20, k.height() - BAR_HEIGHT - MARGIN + 20),
      k.color(255, 255, 255),
      k.fixed(),
      k.z(2),
    ]);

    dialogueTextRef.current = textObj;


    // ----- WORLD BORDERS WITH OUTLINE -----
    // We draw each border piece with a darker outer outline under a lighter main bar.

    const borderColor = k.color(160, 160, 160);
    const outlineColor = k.color(20, 20, 20);

    // helper to draw a strip with outline
    function addBorderStrip(w: number, h: number, x: number, y: number) {
      // outline (slightly larger)
      k.add([
        k.rect(w + BORDER_OUTLINE * 2, h + BORDER_OUTLINE * 2),
        k.pos(x - BORDER_OUTLINE, y - BORDER_OUTLINE),
        outlineColor,
      ]);
      // main strip
      k.add([k.rect(w, h), k.pos(x, y), borderColor]);
    }

    // Top
    addBorderStrip(worldW, BORDER_THICK, worldX, worldY);
    // Left
    addBorderStrip(BORDER_THICK, worldH, worldX, worldY);
    // Bottom
    addBorderStrip(worldW, BORDER_THICK, worldX, worldY + worldH - BORDER_THICK);
    // Right
    addBorderStrip(BORDER_THICK, worldH, worldX + worldW - BORDER_THICK, worldY);

    // ----- PLAYER -----
    const SPEED = 200;
    const PLAYER_RADIUS = 16;

const MAX_STAMINA = 5000;

k.onUpdate(() => {

    // Make sure the stamina bar object exists before trying to update it
    if (staminaBarRef.current) {
        // Calculate the percentage of stamina remaining (a value between 0 and 1)
        const staminaPercentage = playerState.current.stamina / MAX_STAMINA;

        // Calculate the new width of the bar
        const newWidth = STAMINA_BAR_WIDTH * staminaPercentage;

        // Update the 'width' property of the stamina bar rectangle
        staminaBarRef.current.width = newWidth;
    }

    // You can also add the logic to decrease stamina here
    // For example, when the player is running:
    if (playerState.current.runningSpeed > 1 && playerState.current.stamina > 0 &&playerState.current.isSpeedBoosted!) {
        console.log("we r here chat")
        playerState.current.stamina -= 5; // Decrease stamina by 5 every frame
    }
});

    
    const mainCharacter = k.add([
      k.sprite("apple"),
      k.area(),
      k.pos(worldX + worldW / 2, worldY + worldH / 2),
      k.anchor("center"),
      k.z(1)
    ]);
    const STAMINA_REGEN_DELAY = 2000; // 2 seconds in milliseconds
let staminaRegenTimer = 0; // Timer to track regen delay




// Use simple key state checks instead of intervals
k.onKeyDown("shift", () => {
    // When shift is pressed, reset the regen timer
    staminaRegenTimer = 0;
});

    // Input
    k.onKeyDown("w", () => mainCharacter.move(0, -SPEED*playerState.current.runningSpeed));
    k.onKeyDown("a", () => mainCharacter.move(-SPEED*playerState.current.runningSpeed, 0));
    k.onKeyDown("s", () => mainCharacter.move(0, SPEED*playerState.current.runningSpeed));
    k.onKeyDown("d", () => mainCharacter.move(SPEED*playerState.current.runningSpeed, 0));
    k.onUpdate(() => {
    const isSprinting = k.isKeyDown("shift");
        // console.log("this ran",playerState.current.isSpeedBoosted)
    
    // --- BOOST MANAGEMENT ---
    
    // 1. Handle Speed Boost
    if (playerState.current.isSpeedBoosted) {
        // let x = playerState.current.speedBoostTimer
        // console.log(k.dt())
        playerState.current.speedBoostTimer -= k.dt(); // k.dt() is delta time
        
        if (playerState.current.speedBoostTimer <= 0) {
            console.log("we turning ts off")
            playerState.current.isSpeedBoosted = false;
        }
    }


    if (playerState.current.isInvincible) {
        playerState.current.invincibilityTimer -= k.dt();
        if (playerState.current.invincibilityTimer <= 0) {
            playerState.current.isInvincible = false;
            playerState.current.opacity = 1.0; // Reset visual
        }
    }


     let currentSpeedMultiplier = 1.0;
    if (isSprinting && playerState.current.stamina > 0) {
        currentSpeedMultiplier = 2.0;
    }

     if (playerState.current.isSpeedBoosted) {
        // console.log("we in this")
        // Boost adds to the current speed (even when sprinting)
        currentSpeedMultiplier += 1.5; 
    }
    
    playerState.current.runningSpeed = currentSpeedMultiplier;
    console.log()

    // --- Stamina Logic ---
    if (isSprinting && playerState.current.stamina > 0 && playerState.current.isSpeedBoosted!) {
        console.log("the stamina is being drained here")
        // 1. Sprinting: Drain stamina and increase speed
        playerState.current.stamina -= 5; // Drain 5 per frame
        playerState.current.runningSpeed = 2.0;

    } else if (!playerState.current.isSpeedBoosted) {
        // 2. Not Sprinting: Regenerate stamina
        playerState.current.runningSpeed = 1.0;

        // Check if the 2-second delay has passed
        if (staminaRegenTimer < STAMINA_REGEN_DELAY) {
            staminaRegenTimer += k.dt() * 1000; // k.dt() is delta time in seconds
        } else {
            // Delay has passed, start regenerating
            if (playerState.current.stamina < MAX_STAMINA) {
                playerState.current.stamina += 2; // Regenerate 2 per frame
            }
        }
    }

    // Clamp stamina to ensure it doesn't go below 0 or above MAX
    playerState.current.stamina = k.clamp(playerState.current.stamina, 0, MAX_STAMINA);
  
    // --- Visual Bar Update Logic (from before) ---
    if (staminaBarRef.current) {
        const staminaPercentage = playerState.current.stamina / MAX_STAMINA;
        staminaBarRef.current.width = STAMINA_BAR_WIDTH * staminaPercentage;
    }
});

    k.onKeyPress("space", () => {
        handleNext();
    })

    // Hud stats

    // This will position the hearts with a consistent margin
for (let i = 0; i < 3; i++) {
    // Determine the starting sprite based on initial health
    const heartSprite = (i + 1 <= playerState.current.health) ? "heart" : "heart-o";

    k.add([
        k.sprite(heartSprite),
        k.pos(MARGIN + (i * 50), MARGIN),
        k.fixed(),
        k.z(10), // Make sure hearts are on top of other UI
        "ui-heart"
        // k.tag("ui-heart"), // Add a tag to identify them later
    ]);
}
        k.add([
    k.text(`Money: $${playerState.current.money}`, { size: 24 }),
    // X: Start at the left MARGIN
    // Y: Start at the top MARGIN, plus extra space (e.g., 50px) to be below the hearts
    k.pos(MARGIN, MARGIN + 50), 
    k.fixed(),
]);

const SPEED_BOOST_DURATION = 5; // seconds
const INVINCIBILITY_DURATION = 5; // seconds
    for (let i=0; i<5; i++) {
        const myGroup = k.add([
  k.pos(0,0),// The position of the parent object
  "volatility"
]);
         const newEnemy = myGroup.add([
        k.sprite("volatility"),
        
        k.z(1),
        k.scale(0.3),

    ])

        const text = myGroup.add([
      k.text("Volatility", { size: 8 }),
    //   k.color("red"),
      k.pos(0, 30), // Centered horizontally, offset below the sprite
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    allEnemies.current = [...allEnemies.current, myGroup];

    for (const enemy of allEnemies.current) {   
        
        enemy.onUpdate(() => {
    const dir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
    enemy.move(dir.scale(25));

    // Check distance and if the player is NOT invincible
    if (enemy.pos.dist(mainCharacter.pos) < 30 && !playerState.current.isInvincible) {
        playerState.current.health -= 1;
        playerState.current.isSpeedBoosted = true;
        playerState.current.speedBoostTimer = 2;
        console.log("Player hit!");
        const heartObjects = k.get("ui-heart");
        heartObjects.sort((a, b) => a.pos.x - b.pos.x);

        for (let i = 0; i < heartObjects.length; i++) {
            const heart = heartObjects[i];
            // If the heart's index is less than current health, it should be full
            if (i < playerState.current.health) {
                heart.use(k.sprite("heart")); // Change to the 'heart' sprite
            } else {
                heart.destroy();
                // heart.use(k.sprite("heart-o")); // Change to the 'heart-o' sprite
            }
        }

        // Give player temporary invincibility after being hit
        playerState.current.isInvincible = true;
        playerState.current.invincibilityTimer = 2; // 2-second grace period
        playerState.current.opacity = 0.5; // Visual feedback

        // You could also add a small knockback or speed boost here if you want
    }
});
    }

    }


    // mainCharacter.onCollide("volatility", (enemy) => {
    //     console.log("they just collided")

    
    //     k.destroy(enemy);

    // })


   

    



    // ----- CAMERA FOLLOW (centered unless hitting world edges) -----
    function clampCamToWorld(px: number, py: number) {
      const halfW = VIEW_W / 2;
      const halfH = VIEW_H / 2;

      const minCamX = worldX + BORDER_THICK + halfW;
      const maxCamX = worldX + worldW - BORDER_THICK - halfW;
      const minCamY = worldY + BORDER_THICK + halfH;
      const maxCamY = worldY + worldH - BORDER_THICK - halfH;

      let camX = px;
      let camY = py;

      if (camX < minCamX) camX = minCamX;
      if (camX > maxCamX) camX = maxCamX;
      if (camY < minCamY) camY = minCamY;
      if (camY > maxCamY) camY = maxCamY;

      k.camPos(camX, camY);
    }

    // Clamp player to world bounds
    function clampPlayerToWorld() {
      const minX = worldX + BORDER_THICK + PLAYER_RADIUS;
      const maxX = worldX + worldW - BORDER_THICK - PLAYER_RADIUS;
      const minY = worldY + BORDER_THICK + PLAYER_RADIUS;
      const maxY = worldY + worldH - BORDER_THICK - PLAYER_RADIUS;

      if (mainCharacter.pos.x < minX) mainCharacter.pos.x = minX;
      if (mainCharacter.pos.x > maxX) mainCharacter.pos.x = maxX;
      if (mainCharacter.pos.y < minY) mainCharacter.pos.y = minY;
      if (mainCharacter.pos.y > maxY) mainCharacter.pos.y = maxY;
    }

    // Initial camera position
    clampCamToWorld(mainCharacter.pos.x, mainCharacter.pos.y);

    // Per-frame updates
    k.onUpdate(() => {
      clampPlayerToWorld();
      clampCamToWorld(mainCharacter.pos.x, mainCharacter.pos.y);
    });

    return () => {
      // cleanup if you ever remount
      // k.destroyAll();
    };
  }, []);

  return <></>;
}
