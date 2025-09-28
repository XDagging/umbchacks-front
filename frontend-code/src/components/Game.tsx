// src/components/Game.tsx
import React, { useRef, useEffect, useState } from "react";
import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
// import { getHeapSnapshot } from "v8";

type GameProps = {
  onGameOver: () => void;
  triggerQuestion: () => void;
  pausedText: string;
  hasAnswered: boolean;
  // bump this counter when a wrong answer occurs so Game can react (increase round)
  roundIncreaseTrigger?: number;
  // parent-controlled flag that indicates whether unpause is permitted
  canUnpause?: boolean;
};

const aka = [
  "Hi. Welcome to dino",
  "This is a typewriter effect in React.",
  "It reveals text one character at a time.",
  "Isn't it neat?",
];
let timeout: any;
let hasRan = false;
export default function Game({ onGameOver, triggerQuestion, pausedText: _pausedText, hasAnswered: _hasAnswered, roundIncreaseTrigger, canUnpause }: GameProps) {
  const staminaBarRef = useRef<any>(null);
  const hasGameStarted = useRef<any>(null);
  const currentAnimRef = useRef<string>("idleDown");
  const pauseTimer = useRef<any>(null);
  const moneyRef = useRef<any>(null);
  const allProjectiles = useRef<any>([]);

  const [punishRound, setPunishRound] = useState(false);
  const lastRoundTrigger = useRef<number>(0);

  const mainMusic = useRef<any>(null);
  const [dialogueState, setDialogueState] = useState(-1);
  const dialogueTextRef = useRef<any>(null);

  
  useEffect(() => {

    
    if (punishRound) {
        timeout = setTimeout(() => {
          setPunishRound(false);
        },3000)
    }
  


    return () => {
      clearTimeout(timeout);

    }

  },[punishRound])

  // react to roundIncreaseTrigger prop changes - increment in-game round and punish
  useEffect(() => {
    if (typeof roundIncreaseTrigger === "undefined") return;
    // first time, just record the value
    if (lastRoundTrigger.current === 0) {
      lastRoundTrigger.current = roundIncreaseTrigger;
      return;
    }
    if (roundIncreaseTrigger > lastRoundTrigger.current) {
      // increase in-game round and mark punishRound so other logic can respond
      try {
        playerState.current.round += 1;
      } catch (e) {}
      setPunishRound(true);
    }
    lastRoundTrigger.current = roundIncreaseTrigger;
  }, [roundIncreaseTrigger]);


  const allEnemies = useRef<any[]>([]);
  const playerState = useRef({
    xCoord: 0,
    yCoord: 0,
    stamina: 5000,
    runningSpeed: 1.0,
    health: 3,
    money: 0,
    isSpeedBoosted: false,
    speedBoostTimer: 0,
    isInvincible: false,
    opacity: 1,
    invincibilityTimer: 0,
    round: 1,
  });

  const [dialogue, setDialogue] = useState("");

  // Typewriter effect
  useEffect(() => {
    if (dialogueState < 0 || dialogueState >= aka.length) {
  return;
}
    if (dialogueState < aka.length) {
      const fullDialogue = aka[dialogueState];
      setDialogue("");
      let currentIndex = 0;
      const typingSpeed = 50;
      const intervalId = setInterval(() => {
        if (currentIndex >= fullDialogue?.length - 1) {
          clearInterval(intervalId);
          return;
        }
        setDialogue((prev) => prev + fullDialogue[currentIndex] || "");
        currentIndex++;
      }, typingSpeed);
      return () => clearInterval(intervalId);
    }
  }, [dialogueState]);

  useEffect(() => {
    if (dialogueTextRef.current) {
      dialogueTextRef.current.text = dialogue;
    }
  }, [dialogue]);

  const handleNext = () => {
    if (dialogueState < aka.length - 1) {
      setDialogueState((s) => s + 1);
    }
  };

  useEffect(() => {
    if (hasGameStarted.current) return;
    
    if (hasRan) return
    console.log("this ran multiple times")
    const k = kaplay({
      plugins: [crew],
      font: "happy",
      background: [0, 0, 0],
      backgroundAudio: true,
      width: Math.floor(window.innerWidth / 6) * 4,
      height: window.innerHeight,
    });


    hasRan = true;
    

    k.scene("game", () => {
       hasGameStarted.current = k;

    k.canvas.style.position = "absolute";
    k.canvas.style.top = "0px";
    k.canvas.style.left = "0px";

    // Sounds
    k.loadSound("coinSound", "coin.wav")
    k.loadSound("hurt", "hurt.wav");
    k.loadSound("soundtrack", "soundtrack.mp3");
    if (!mainMusic.current) {
      mainMusic.current = k.play("soundtrack", { loop: true, volume: 0.8 });
    }

    // Assets
    k.loadSprite("questionBlock", "questionBlock.png")
    k.loadSprite("coin", "coin.png", {
      
      sliceX: 9,
      sliceY: 1,
      anims: {
        move: {
          from:0,
          to: 3,
          speed:20,
          loop:true
        }
      }
    })

    k.loadSprite("thrower", "ThrowerDino.png", {
      sliceX: 12,
      // singular: true,
      sliceY: 1
    });
      const COLS = 6;
      const ROWS = 10;
      const WALK_FRAMES = 6;

      const idx = (r: number, c: number) => r * COLS + c;

      const RIGHT_ROW = 1;
      const UP_ROW = 2;
      const DOWN_ROW = 3;

      k.loadSprite("hero", "hero.png", {
        sliceX: COLS,
        sliceY: ROWS,
        anims: {
          // use the RIGHT row for both horizontal directions; left will be mirrored with scale.x
          walkRight: {
            from: idx(RIGHT_ROW, 0),
            to: idx(RIGHT_ROW, WALK_FRAMES - 1),
            speed: 10,
            loop: true,
            pingpong: false, // <— important so it cycles 0..5..0 smoothly
          },
          // same frames; we only flip the sprite when moving left
          walkLeft: {
            from: idx(RIGHT_ROW, 0),
            to: idx(RIGHT_ROW, WALK_FRAMES - 1),
            speed: 10,
            loop: true,
            pingpong: false,
          },
          walkUp: {
            from: idx(UP_ROW, 0),
            to: idx(UP_ROW, WALK_FRAMES - 1),
            speed: 10,
            loop: true,
            pingpong: false,
          },
          walkDown: {
            from: idx(DOWN_ROW, 0),
            to: idx(DOWN_ROW, WALK_FRAMES - 1),
            speed: 10,
            loop: true,
            pingpong: false,
          },

          // idle frames (pick a neutral column, e.g., last)
          idleRight: idx(RIGHT_ROW, COLS - 1),
          idleLeft: idx(RIGHT_ROW, COLS - 1), // same frame; we mirror with scale.x
          idleUp: idx(UP_ROW, COLS - 1),
          idleDown: idx(DOWN_ROW, COLS - 1),
        },
      });
  

    k.loadCrew("sprite", "heart-o");
    k.loadCrew("sprite", "heart");
    k.loadCrew("sprite", "apple");
    k.loadCrew("sprite", "grape", "purplefruit");
    k.loadCrew("font", "happy");
    k.loadSprite("volatility", "volatility.png");
    k.loadSprite("grass", "grass.png");

    // HUD sizes
    const BAR_HEIGHT = 100;
    const MARGIN = 50;

    // WORLD GEOMETRY
    const VIEW_W = k.width();
    const VIEW_H = k.height();
    const MAP_MARGIN = 32;
    const BORDER_THICK = 6;
    const BORDER_OUTLINE = 3;
    const UI_BOTTOM = BAR_HEIGHT + MARGIN;

    const baseMaxW = VIEW_W - MAP_MARGIN * 2;
    const baseMaxH = VIEW_H - UI_BOTTOM - MAP_MARGIN;
    const baseSize = Math.min(baseMaxW, baseMaxH);

    const worldSize = baseSize * 3; // 3x side => 9x area
    const worldW = worldSize;
    const worldH = worldSize;

    const worldX =
      Math.floor((VIEW_W - baseSize) / 2) - (worldSize - baseSize) / 2;
    const worldY = MAP_MARGIN - (worldSize - baseSize);

    const innerX = worldX + BORDER_THICK;
    const innerY = worldY + BORDER_THICK;
    const innerW = worldW - BORDER_THICK * 2;
    const innerH = worldH - BORDER_THICK * 2;

    // World fill + grid
    k.add([k.rect(innerW, innerH), k.pos(innerX, innerY), k.color(20, 40, 60)]);
    const GRID = 64;
    for (let x = innerX + GRID; x < innerX + innerW; x += GRID) {
      k.add([k.rect(1, innerH), k.pos(Math.floor(x), innerY), k.color(70, 90, 110)]);
    }
    for (let y = innerY + GRID; y < innerY + innerH; y += GRID) {
      k.add([k.rect(innerW, 1), k.pos(innerX, Math.floor(y)), k.color(70, 90, 110)]);
    }

    // Stamina bar (top-right)
    const STAMINA_BAR_WIDTH = 200;
    const STAMINA_BAR_HEIGHT = 40;
    const staminaBarX = k.width() - MARGIN;
    const staminaBarY = MARGIN;

    const BORDER_THICKNESS = 4;

    const staminaGroup = k.add([k.pos(staminaBarX, staminaBarY), k.anchor("topright"), k.fixed(), k.z(2)]);
    staminaGroup.add([k.rect(STAMINA_BAR_WIDTH + 8, STAMINA_BAR_HEIGHT), k.pos(0, 0), k.color(0, 0, 0), k.anchor("topright")]);

    const innerBarMaxWidth = STAMINA_BAR_WIDTH - BORDER_THICKNESS * 2;
    const innerBarHeight = STAMINA_BAR_HEIGHT - BORDER_THICKNESS * 2;

    staminaBarRef.current = staminaGroup.add([
      k.rect(innerBarMaxWidth, innerBarHeight),
      k.pos(-BORDER_THICKNESS, BORDER_THICKNESS),
      k.color(0, 255, 0),
      k.anchor("topright"),
    ]);



    

    staminaGroup.add([
      k.text("Stamina", { size: 24 }),
      k.pos(-STAMINA_BAR_WIDTH / 2, STAMINA_BAR_HEIGHT / 2),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    // Grass tiles
    for (let y = innerY; y < innerY + innerH; y += GRID) {
      for (let x = innerX; x < innerX + innerW; x += GRID) {
          // const dir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
        if (0.005*playerState.current.round>Math.random()) {
           const myGroup = k.add([ k.pos(x,y), "volatility"]);
          
      myGroup.add([k.sprite("volatility"), k.z(2), k.scale(0.3)]);
      // myGroup.add([k.text("Debt", { size: 8 }), k.pos(0, 30), k.anchor("center"), k.color(255, 255, 255)]);
      allEnemies.current = [...allEnemies.current, myGroup];
        }


        if (0.001*playerState.current.round>Math.random()) {
          const newEnemy = k.add([k.sprite("thrower"), k.z(1), k.scale(2), k.pos(x,y), "thrower", {
            fireCooldown: 0,
          }]);

           allEnemies.current = [...allEnemies.current, newEnemy]
        }

        if (0.02*(playerState.current.round/2)>Math.random()) {
          
          k.add([
            k.sprite("coin"), k.pos(x,y), k.z(1), k.scale(GRID/64), "coin",
            k.area()
          ])
        }

        if (0.05>Math.random()) {
          
          const visualScale = GRID / 128;

k.add([
    k.sprite("questionBlock"),
    k.pos(x,y),
    k.scale(visualScale),
    k.z(1),
    "questionBlock",
    k.area({ scale: visualScale }) // Now the hitbox scales with the sprite!
])

         
        }
        k.add([k.sprite("grass"), k.pos(x, y), k.z(0), k.scale(GRID / 18)]);
      }
    }


  


  
    // Dialogue bar
    k.add([
      k.rect(k.width() - MARGIN * 2, BAR_HEIGHT),
      k.pos(MARGIN, k.height() - BAR_HEIGHT - MARGIN),
      k.fixed(),
      k.color(50, 50, 50),
      k.z(2),
    ]);
    if (dialogueState === -1) handleNext();

    const textObj = k.add([
      k.text("", { size: 24 }),
      k.pos(MARGIN + 20, k.height() - BAR_HEIGHT - MARGIN + 20),
      k.color(255, 255, 255),
      k.fixed(),
      k.z(2),
    ]);
    dialogueTextRef.current = textObj;

    

    // World borders with outline
    const borderColor = k.color(160, 160, 160);
    const outlineColor = k.color(20, 20, 20);
    function addBorderStrip(w: number, h: number, x: number, y: number) {
      k.add([k.rect(w + BORDER_OUTLINE * 2, h + BORDER_OUTLINE * 2), k.pos(x - BORDER_OUTLINE, y - BORDER_OUTLINE), outlineColor]);
      k.add([k.rect(w, h), k.pos(x, y), borderColor]);
    }
    addBorderStrip(worldW, BORDER_THICK, worldX, worldY);
    addBorderStrip(BORDER_THICK, worldH, worldX, worldY);
    addBorderStrip(worldW, BORDER_THICK, worldX, worldY + worldH - BORDER_THICK);
    addBorderStrip(BORDER_THICK, worldH, worldX + worldW - BORDER_THICK, worldY);

    // Player
    const SPEED = 200;
    const PLAYER_RADIUS = 16;
    const MAX_STAMINA = 5000;

    const playerScale = 4
     const mainCharacter = k.add([
        k.sprite("hero", { anim: "idleDown" }),
        k.area({scale: playerScale/16}),
        k.pos(worldX + worldW / 2, worldY + worldH / 2),
        k.anchor("center"),
        k.scale(4), // <-- ensure scale component exists
        k.z(1),
      ]);

       const faceRight = () => {
        mainCharacter.scale.x = Math.abs(mainCharacter.scale.x || 1);
      };
      const faceLeft = () => {
        mainCharacter.scale.x = -Math.abs(mainCharacter.scale.x || 1);
      };
      // default face right
      faceRight();
 let lastDir: "up" | "down" | "left" | "right" = "down";


    mainCharacter.onCollide("coin", (hey) => {
      console.log("this was triggered")
      k.play("coinSound", {
        volume: 1 
      })


      const totalX = ((innerY + innerH) / Math.ceil(Math.random()*GRID));
      const totalY = ((innerX + innerW) / Math.ceil(Math.random()*GRID));
      
      k.add([
            k.sprite("coin"), k.pos(totalX,totalY), k.z(1), k.scale(GRID/64), "coin",
            k.area()
          ])
          
      playerState.current.money += 1;

      // moneyRef.current.destroy()
      moneyRef.current.text = `Money: $${playerState.current.money}`

      hey.destroy();
    })
  mainCharacter.onCollide("questionBlock", (_person: any) => {
        console.log("we got a question ladies")
        k.go("pause");
        triggerQuestion();

      
 
    })
    // Input + stamina
    const STAMINA_REGEN_DELAY = 2000;
    let staminaRegenTimer = 0;


    

    k.onKeyDown("shift", () => {
      staminaRegenTimer = 0;
    });
       const playIfDiff = (anim: string) => {
        if (currentAnimRef.current !== anim) {
          mainCharacter.play(anim);
          currentAnimRef.current = anim;
        }
      };
    k.onKeyDown("a", () => {
        mainCharacter.move(-SPEED * playerState.current.runningSpeed, 0);
        faceLeft();
        playIfDiff("walkLeft"); // <- no getCurAnim() compare
        lastDir = "left";
      });

      k.onKeyDown("d", () => {
        mainCharacter.move(SPEED * playerState.current.runningSpeed, 0);
        faceRight();
        playIfDiff("walkRight");
        lastDir = "right";
      });

      k.onKeyDown("w", () => {
        mainCharacter.move(0, -SPEED * playerState.current.runningSpeed);
        playIfDiff("walkUp");
        lastDir = "up";
      });

      k.onKeyDown("s", () => {
        mainCharacter.move(0, SPEED * playerState.current.runningSpeed);
        playIfDiff("walkDown");
        lastDir = "down";
      });
      k.onUpdate(() => {
        const moving =
          k.isKeyDown("w") ||
          k.isKeyDown("a") ||
          k.isKeyDown("s") ||
          k.isKeyDown("d");

        if (!moving) {
          if (lastDir === "left") {
            faceLeft();
            playIfDiff("idleLeft");
          } else if (lastDir === "right") {
            faceRight();
            playIfDiff("idleRight");
          } else if (lastDir === "up") {
            playIfDiff("idleUp");
          } else {
            playIfDiff("idleDown");
          }
        }
      });

    k.onUpdate(() => {
      const isSprinting = k.isKeyDown("shift");

      if (playerState.current.isSpeedBoosted) {
        playerState.current.speedBoostTimer -= k.dt();
        if (playerState.current.speedBoostTimer <= 0) {
          playerState.current.isSpeedBoosted = false;
        }
      }
      if (playerState.current.isInvincible) {
        playerState.current.invincibilityTimer -= k.dt();
        if (playerState.current.invincibilityTimer <= 0) {
          playerState.current.isInvincible = false;
          playerState.current.opacity = 1.0;
        }
      }
      

      let currentSpeedMultiplier = 1.0;
      if (isSprinting && playerState.current.stamina > 0) currentSpeedMultiplier = 2.0;
      if (playerState.current.isSpeedBoosted) currentSpeedMultiplier += 1.5;
      playerState.current.runningSpeed = currentSpeedMultiplier;

      if ((isSprinting || playerState.current.isSpeedBoosted) && playerState.current.stamina > 0) {
        playerState.current.stamina -= 5;
        playerState.current.runningSpeed = Math.max(playerState.current.runningSpeed, 2.0);
      } else if (!playerState.current.isSpeedBoosted) {
        playerState.current.runningSpeed = Math.max(1.0, currentSpeedMultiplier);
        if (staminaRegenTimer < STAMINA_REGEN_DELAY) staminaRegenTimer += k.dt() * 1000;
        else if (playerState.current.stamina < MAX_STAMINA) playerState.current.stamina += 2;
      }

      playerState.current.stamina = k.clamp(playerState.current.stamina, 0, MAX_STAMINA);
      if (staminaBarRef.current) {
        const staminaPercentage = playerState.current.stamina / MAX_STAMINA;
        staminaBarRef.current.width = 200 * staminaPercentage;
      }
    });

    k.onKeyPress("space", () => handleNext());

    // Hearts UI
    for (let i = 0; i < 3; i++) {
      const heartSprite = i + 1 <= playerState.current.health ? "heart" : "heart-o";
      k.add([k.sprite(heartSprite), k.pos(MARGIN + i * 50, MARGIN), k.fixed(), k.z(10), "ui-heart"]);
    }

    // Money UI
    moneyRef.current = k.add([k.text(`Money: $${playerState.current.money}`, { size: 24 }), k.pos(MARGIN, MARGIN + 50), k.z(2), k.fixed()]);

    // Enemies
  // for (let i = 0; i < 5; i++) {
     

      mainCharacter.onCollide("projectile", (projectile) => {
        if (!playerState.current.isInvincible) {
            k.play("hurt", { volume: 1 });
            playerState.current.health -= 1;
    

          // Update hearts
          const heartObjects = k.get("ui-heart");
          heartObjects.sort((a, b) => a.pos.x - b.pos.x);
          for (let i = 0; i < heartObjects.length; i++) {
            const heart = heartObjects[i];
            if (i < playerState.current.health) {
              heart.use(k.sprite("heart"));
            } else {
              heart.destroy();
            }

            
          }

          

           playerState.current.isSpeedBoosted = true;
          playerState.current.speedBoostTimer = 2;
          playerState.current.isInvincible = true;
          playerState.current.invincibilityTimer = 2;
          playerState.current.opacity = 0.5;
            // Similar logic to update hearts and check for game over...
        }
        projectile.destroy();
    });

    // }

    for (const enemy of allEnemies.current) {
      
      enemy.onUpdate(() => {
        const dir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
        // console.log("this is the enemy", enemy)
        enemy.move(dir.scale(25 * (1.2*playerState.current.round)));
     

          if (enemy.is("thrower")) {
            // Only fire if cooldown is ready
           
                // const projectileDir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
                if (enemy.fireCooldown > 0) {
                  enemy.fireCooldown -= k.dt(); // k.dt() is "delta time"
                }
                if (enemy.fireCooldown <= 0) {
                const projectileDir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
                const asdf = k.add([
                    k.rect(8, 8),
                    k.color(255, 0, 0),
                    k.pos(enemy.pos),
                    k.move(projectileDir, 300), // Make the projectile move
                    k.area(),
                    k.z(1),

                    "projectile",
                ]);
                // Disappears after 4 seconds
                k.wait(4, () => {
                  asdf.destroy();
                })
                // Reset the cooldown
                enemy.fireCooldown = 2; // Fire every 2 seconds
            }
            }
          if (playerState.current.health <= 0) {
            
            try { 
              if (mainMusic.current) mainMusic.current.stop();
            } catch {}
            // Let React show the GameOverScreen
            

            onGameOver();
            return;
          }


        
        
        // Hit detection
        if (enemy.pos.dist(mainCharacter.pos) < 30 && !playerState.current.isInvincible) {
          k.play("hurt", { volume: 1 });
          playerState.current.health -= 1;

          // Update hearts
          const heartObjects = k.get("ui-heart");
          heartObjects.sort((a, b) => a.pos.x - b.pos.x);
          for (let i = 0; i < heartObjects.length; i++) {
            const heart = heartObjects[i];
            if (i < playerState.current.health) {
              heart.use(k.sprite("heart"));
            } else {
              heart.destroy();
            }
          }

          // Game over trigger
         

          // Hurt boost + i-frames
          playerState.current.isSpeedBoosted = true;
          playerState.current.speedBoostTimer = 2;
          playerState.current.isInvincible = true;
          playerState.current.invincibilityTimer = 2;
          playerState.current.opacity = 0.5;
        }
      });
    }

    // Camera follow with clamping
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

    clampCamToWorld(mainCharacter.pos.x, mainCharacter.pos.y);
    k.onUpdate(() => {
      clampPlayerToWorld();
      clampCamToWorld(mainCharacter.pos.x, mainCharacter.pos.y);
    });


    })

  k.scene("pause", () => {
    // Add a semi-transparent background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0),
        k.opacity(0.5),
        k.fixed(), // Makes it stay in place regardless of camera
    ]);

    // Add the menu text
    k.add([
        k.text("Paused", { size: 50 }),
        k.pos(k.center()),
        k.anchor("center"),
        k.fixed(),
    ]);

    k.add([
        k.text("Press 'p' to Resume", { size: 24 }),
        k.pos(k.center().add(0, 80)),
        k.anchor("center"),
        k.fixed(),
    ]);

    pauseTimer.current = k.add([
      k.text("", {size: 18}),
      k.pos(k.center().add(0, 120)),
      k.anchor("center"),
      k.fixed()
    ])
    
    // When "p" is pressed again, pop the pause scene to return to the game
   

    // Optional: Add a quit button
    k.onKeyPress("p", () => {
      // Only unpause when the parent explicitly allows it via canUnpause
      if (canUnpause) {
        k.go("game");
      } else {
        pauseTimer.current.text = "Wait a few seconds to continue playing.";
      }
    });
});



    k.go("game");


    
    // Keep a reference to destroy later on unmount
   
    // Cleanup on unmount
    return () => {
      try {
        if (mainMusic.current) {
          mainMusic.current.stop();
          mainMusic.current = null;
        }
      } catch {}
      try {
        // Destroy Kaplay instance content
        k.destroyAll("");
      } catch {}
      hasGameStarted.current = null;
    };
  }, [dialogueState, onGameOver]);

  return null;
}
