import React, { useRef, useEffect, useState } from "react";

import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
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

// This helps prevent re-initialization on hot-reloads in development.
let hasKaplayBeenInitialized = false;

export default function Game({ onGameOver, triggerQuestion, roundIncreaseTrigger, canUnpause }: GameProps) {
  // A ref to hold the Kaplay instance, making it accessible across effects.
  const kaplayRef = useRef<any>(null);
  
  const staminaBarRef = useRef<any>(null);
  const currentAnimRef = useRef<string>("idleDown");
  const moneyRef = useRef<any>(null);
  const mainMusic = useRef<any>(null);
  const roundTextRef = useRef<any>(null);
  
  const [punishRound, setPunishRound] = useState(false);
  const lastRoundTrigger = useRef<number>(-1);

  const playerState = useRef({
    stamina: 5000,
    runningSpeed: 1.0,
    health: 3,
    money: 0,
    isSpeedBoosted: false,
    speedBoostTimer: 0,
    isInvincible: false,
    invincibilityTimer: 0,
    round: 1,
  });

  useEffect(() => {
    let timeout: any;
    if (punishRound) {
      timeout = setTimeout(() => {
        setPunishRound(false);
      }, 3000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [punishRound]);

  useEffect(() => {
    if (typeof roundIncreaseTrigger === "undefined") return;
    if (lastRoundTrigger.current === -1) {
      lastRoundTrigger.current = roundIncreaseTrigger;
      return;
    }
    if (roundIncreaseTrigger > lastRoundTrigger.current) {
      playerState.current.round = (playerState.current.round || 1) + 1;
      console.log("Round increased to", playerState.current.round);
      setPunishRound(true);
    }
    lastRoundTrigger.current = roundIncreaseTrigger;
  }, [roundIncreaseTrigger]);

  // This is the NEW reactive useEffect hook that handles unpausing.
  // It re-runs whenever `canUnpause` changes, creating a new listener with the latest value.
  useEffect(() => {
    const k = kaplayRef.current;
    if (!k) return;

    const unpauseListener = k.onKeyPress("p", () => {
      if (k.getSceneName() === "pause") {
        console.log("P pressed in pause scene. Can unpause:", canUnpause);
        if (canUnpause) {
          playerState.current.round += 1;
          k.go("game");
        }
      }
    });

    // Cleanup function removes the old listener to prevent duplicates.
    return () => {
      unpauseListener.cancel();
    };
  }, [canUnpause]);

  // This is the main game initialization effect.
  // It has an empty dependency array `[]` so it runs only ONCE per mount.
  useEffect(() => {
    if (hasKaplayBeenInitialized) return;

    // @ts-ignore - Assuming kaplay and crew are loaded globally
    const k = kaplay({
      // @ts-ignore
      plugins: [crew],
      font: "happy",
      background: [0, 0, 0],
      backgroundAudio: true,
      width: Math.floor(window.innerWidth / 6) * 4,
      height: window.innerHeight,
    });

    kaplayRef.current = k;
    hasKaplayBeenInitialized = true;

    k.scene("game", () => {
      k.canvas.style.position = "absolute";
      k.canvas.style.top = "0px";
      k.canvas.style.left = "0px";

      // Sounds
      k.loadSound("coinSound", "coin.wav");
      k.loadSound("hurt", "hurt.wav");
      k.loadSound("soundtrack", "soundtrack.mp3");
      if (!mainMusic.current) {
        mainMusic.current = k.play("soundtrack", { loop: true, volume: 0.8 });
      }

      // Assets
      k.loadSprite("questionBlock", "questionBlock.png");
      k.loadSprite("coin", "coin.png", {
        sliceX: 9,
        sliceY: 1,
        anims: {
          move: { from: 0, to: 3, speed: 20, loop: true },
        },
      });
      k.loadSprite("thrower", "ThrowerDino.png", { sliceX: 12, sliceY: 1 });

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
          walkRight: { from: idx(RIGHT_ROW, 0), to: idx(RIGHT_ROW, WALK_FRAMES - 1), speed: 10, loop: true },
          walkLeft: { from: idx(RIGHT_ROW, 0), to: idx(RIGHT_ROW, WALK_FRAMES - 1), speed: 10, loop: true },
          walkUp: { from: idx(UP_ROW, 0), to: idx(UP_ROW, WALK_FRAMES - 1), speed: 10, loop: true },
          walkDown: { from: idx(DOWN_ROW, 0), to: idx(DOWN_ROW, WALK_FRAMES - 1), speed: 10, loop: true },
          idleRight: idx(RIGHT_ROW, COLS - 1),
          idleLeft: idx(RIGHT_ROW, COLS - 1),
          idleUp: idx(UP_ROW, COLS - 1),
          idleDown: idx(DOWN_ROW, COLS - 1),
        },
      });

      k.loadCrew("sprite", "heart-o");
      k.loadCrew("sprite", "heart");
      k.loadCrew("font", "happy");
      k.loadSprite("volatility", "volatility.png");
      k.loadSprite("grass", "grass.png");

      // World Geometry & UI Constants
      const BAR_HEIGHT = 100;
      const MARGIN = 50;
      const VIEW_W = k.width();
      const VIEW_H = k.height();
      const MAP_MARGIN = 32;
      const BORDER_THICK = 6;
      const UI_BOTTOM = BAR_HEIGHT + MARGIN;
      const baseMaxW = VIEW_W - MAP_MARGIN * 2;
      const baseMaxH = VIEW_H - UI_BOTTOM - MAP_MARGIN;
      const baseSize = Math.min(baseMaxW, baseMaxH);
      const worldSize = baseSize * 3;
      const worldW = worldSize;
      const worldH = worldSize;
      const worldX = Math.floor((VIEW_W - baseSize) / 2) - (worldSize - baseSize) / 2;
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


      

      // Stamina bar
      const STAMINA_BAR_WIDTH = 200;
      const STAMINA_BAR_HEIGHT = 40;
      const BORDER_THICKNESS = 4;
      const staminaGroup = k.add([k.pos(k.width() - MARGIN, MARGIN), k.anchor("topright"), k.fixed(), k.z(2)]);
      staminaGroup.add([k.rect(STAMINA_BAR_WIDTH + 8, STAMINA_BAR_HEIGHT), k.color(0, 0, 0), k.anchor("topright")]);
      staminaBarRef.current = staminaGroup.add([k.rect(STAMINA_BAR_WIDTH - BORDER_THICKNESS * 2, STAMINA_BAR_HEIGHT - BORDER_THICKNESS * 2), k.pos(-BORDER_THICKNESS, BORDER_THICKNESS), k.color(0, 255, 0), k.anchor("topright")]);
      staminaGroup.add([k.text("Stamina", { size: 24 }), k.pos(-STAMINA_BAR_WIDTH / 2, STAMINA_BAR_HEIGHT / 2), k.anchor("center"), k.color(255, 255, 255)]);

      // World content spawning
      const allEnemies: any[] = [];
      for (let y = innerY; y < innerY + innerH; y += GRID) {
        for (let x = innerX; x < innerX + innerW; x += GRID) {
          if (0.005 * playerState.current.round > Math.random()) {
            const enemy = k.add([k.pos(x, y), "volatility"]);
            enemy.add([k.sprite("volatility"), k.z(2), k.scale(0.3)]);
            allEnemies.push(enemy);
          }
          if (0.001 * playerState.current.round > Math.random()) {
            const enemy = k.add([k.sprite("thrower"), k.z(1), k.scale(2), k.pos(x, y), "thrower", { fireCooldown: 0 }]);
            allEnemies.push(enemy);
          }
          if (0.02 * (playerState.current.round / 2) > Math.random()) {
            k.add([k.sprite("coin"), k.pos(x, y), k.z(1), k.scale(GRID / 64), "coin", k.area()]);
          }
          if (0.05 > Math.random()) {
            const visualScale = GRID / 128;
            k.add([k.sprite("questionBlock"), k.pos(x, y), k.scale(visualScale), k.z(1), "questionBlock", k.area({ scale: visualScale })]);
          }
          k.add([k.sprite("grass"), k.pos(x, y), k.z(0), k.scale(GRID / 18)]);
        }
      }
      

     k.add([
      k.text(`Round: ${playerState.current.round}`, { size: 64 }),
      k.pos(k.center()),
      k.anchor("center"),
      k.fixed(),
      k.z(100), // Make sure it's on top of other UI
      k.opacity(1), // The lifespan component requires this when fading
      k.lifespan(3, { fade: 0.5 }), // Disappears in 3 seconds, fades out in the last 0.5s
    ]);
      // World borders
      const borderColor = k.color(160, 160, 160);
      const outlineColor = k.color(20, 20, 20);
      function addBorderStrip(w: number, h: number, x: number, y: number) {
        k.add([k.rect(w + 3 * 2, h + 3 * 2), k.pos(x - 3, y - 3), outlineColor]);
        k.add([k.rect(w, h), k.pos(x, y), borderColor]);
      }
      addBorderStrip(worldW, BORDER_THICK, worldX, worldY);
      addBorderStrip(BORDER_THICK, worldH, worldX, worldY);
      addBorderStrip(worldW, BORDER_THICK, worldX, worldY + worldH - BORDER_THICK);
      addBorderStrip(BORDER_THICK, worldH, worldX + worldW - BORDER_THICK, worldY);
      
      // Player
      const SPEED = 200;
      const PLAYER_RADIUS = 16;
      const playerScale = 4;
      const mainCharacter = k.add([
        k.sprite("hero", { anim: "idleDown" }),
        k.area({ scale: playerScale / 16 }),
        k.pos(worldX + worldW / 2, worldY + worldH / 2),
        k.anchor("center"),
        k.scale(playerScale),
        k.z(1),
      ]);
      
      const faceRight = () => { mainCharacter.scale.x = Math.abs(mainCharacter.scale.x || 1); };
      const faceLeft = () => { mainCharacter.scale.x = -Math.abs(mainCharacter.scale.x || 1); };
      faceRight();
      let lastDir: "up" | "down" | "left" | "right" = "down";

      // Player Collision
      mainCharacter.onCollide("coin", (coin:any) => {
        k.play("coinSound", { volume: 1 });
        playerState.current.money += 1;
        moneyRef.current.text = `Money: $${playerState.current.money}`;
        coin.destroy();
      });

      mainCharacter.onCollide("questionBlock", (questionBlock:any) => {
        console.log("Collision with question block, triggering question and pausing.");
        triggerQuestion();
        k.go("pause");
        questionBlock.destroy();
      });
      
      mainCharacter.onCollide("projectile", (projectile: any) => {
        if (!playerState.current.isInvincible) {
            handlePlayerDamage();
        }
        projectile.destroy();
      });

      // Player Input & Animation
      const playIfDiff = (anim: string) => {
        if (currentAnimRef.current !== anim) {
          mainCharacter.play(anim);
          currentAnimRef.current = anim;
        }
      };
      k.onKeyDown("a", () => { mainCharacter.move(-SPEED * playerState.current.runningSpeed, 0); faceLeft(); playIfDiff("walkLeft"); lastDir = "left"; });
      k.onKeyDown("d", () => { mainCharacter.move(SPEED * playerState.current.runningSpeed, 0); faceRight(); playIfDiff("walkRight"); lastDir = "right"; });
      k.onKeyDown("w", () => { mainCharacter.move(0, -SPEED * playerState.current.runningSpeed); playIfDiff("walkUp"); lastDir = "up"; });
      k.onKeyDown("s", () => { mainCharacter.move(0, SPEED * playerState.current.runningSpeed); playIfDiff("walkDown"); lastDir = "down"; });

      // Main Game Loop
      k.onUpdate(() => {
        const moving = k.isKeyDown("w") || k.isKeyDown("a") || k.isKeyDown("s") || k.isKeyDown("d");
        if (!moving) {
            if (lastDir === "left") { faceLeft(); playIfDiff("idleLeft"); } 
            else if (lastDir === "right") { faceRight(); playIfDiff("idleRight"); }
            else if (lastDir === "up") { playIfDiff("idleUp"); } 
            else { playIfDiff("idleDown"); }
        }

        // Handle stamina, speed boost, invincibility
        if (playerState.current.isSpeedBoosted) {
          playerState.current.speedBoostTimer -= k.dt();
          if (playerState.current.speedBoostTimer <= 0) playerState.current.isSpeedBoosted = false;
        }
        if (playerState.current.isInvincible) {
          playerState.current.invincibilityTimer -= k.dt();
          if (playerState.current.invincibilityTimer <= 0) playerState.current.isInvincible = false;
        }
        
        let currentSpeedMultiplier = 1.0;
        const isSprinting = k.isKeyDown("shift");
        if (isSprinting && playerState.current.stamina > 0) {
            currentSpeedMultiplier = 2.0;
            playerState.current.stamina -= 5;
        } else if (playerState.current.stamina < 5000) {
            playerState.current.stamina += 2;
        }

        if (playerState.current.isSpeedBoosted) currentSpeedMultiplier += 1.5;
        playerState.current.runningSpeed = currentSpeedMultiplier;
        
        playerState.current.stamina = k.clamp(playerState.current.stamina, 0, 5000);
        staminaBarRef.current.width = (STAMINA_BAR_WIDTH - BORDER_THICKNESS * 2) * (playerState.current.stamina / 5000);
        
        // Clamp player position
        mainCharacter.pos.x = k.clamp(mainCharacter.pos.x, innerX + PLAYER_RADIUS, innerX + innerW - PLAYER_RADIUS);
        mainCharacter.pos.y = k.clamp(mainCharacter.pos.y, innerY + PLAYER_RADIUS, innerY + innerH - PLAYER_RADIUS);

        // Calculate clamped camera position to keep it within world bounds
        const camX = k.clamp(mainCharacter.pos.x, innerX + VIEW_W / 2, innerX + innerW - VIEW_W / 2);
        const camY = k.clamp(mainCharacter.pos.y, innerY + VIEW_H / 2, innerY + innerH - VIEW_H / 2);
        k.camPos(camX, camY);
      });
      
      // UI Setup
      for (let i = 0; i < 3; i++) {
        k.add([k.sprite("heart"), k.pos(MARGIN + i * 50, MARGIN), k.fixed(), k.z(10), "ui-heart"]);
      }
      moneyRef.current = k.add([k.text(`Money: $${playerState.current.money}`, { size: 24 }), k.pos(MARGIN, MARGIN + 50), k.z(2), k.fixed()]);
      
        const updateHearts = () => {
        const heartObjects = k.get("ui-heart");

        // If the number of hearts on screen is greater than the player's health, remove one.
        if (heartObjects.length > playerState.current.health) {
          // Sort hearts from left to right to ensure we always remove the last one.
          heartObjects.sort((a, b) => a.pos.x - b.pos.x);
          // Get the last heart object and destroy it.
          const lastHeart = heartObjects[heartObjects.length - 1];
          if (lastHeart) {
            lastHeart.destroy();
          }
        }

        if (playerState.current.health <= 0) {
          try { if (mainMusic.current) mainMusic.current.stop(); } catch {}
          onGameOver();
        }
      };
      
      const handlePlayerDamage = () => {
          k.play("hurt", { volume: 1 });
          playerState.current.health -= 1;
          updateHearts();
          playerState.current.isSpeedBoosted = true;
          playerState.current.speedBoostTimer = 2;
          playerState.current.isInvincible = true;
          playerState.current.invincibilityTimer = 2;
      }
      
      // Enemy Logic
      for (const enemy of allEnemies) {
        enemy.onUpdate(() => {
          const dir = k.vec2(mainCharacter.pos).sub(enemy.pos).unit();
          enemy.move(dir.scale(25 * (1.2 * playerState.current.round)));
          
          if (enemy.is("thrower")) {
            if (enemy.fireCooldown > 0) {
              enemy.fireCooldown -= k.dt();
            }
            if (enemy.fireCooldown <= 0) {
              const projectile = k.add([ k.rect(8, 8), k.color(255, 0, 0), k.pos(enemy.pos), k.move(dir, 300), k.area(), k.z(1), "projectile"]);
              k.wait(4, () => projectile.destroy());
              enemy.fireCooldown = 2;
            }
          }

          if (enemy.pos.dist(mainCharacter.pos) < 30 && !playerState.current.isInvincible) {
              handlePlayerDamage();
          }
        });
      }
    });

    k.scene("pause", () => {
      k.add([ k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.5), k.fixed() ]);
      k.add([ k.text("Paused", { size: 50 }), k.pos(k.center()), k.anchor("center"), k.fixed() ]);
      k.add([ k.text("Answer the question to continue...", { size: 24 }), k.pos(k.center().add(0, 80)), k.anchor("center"), k.fixed(), "pause-message" ]);
      // The onKeyPress 'p' listener has been MOVED to its own reactive useEffect.
    });

    k.go("game");




    return () => {
      try {
        if (mainMusic.current) {
          mainMusic.current.stop();
          mainMusic.current = null;
        }
        if (kaplayRef.current) {
            kaplayRef.current.destroy();
            kaplayRef.current = null;
        }
        hasKaplayBeenInitialized = false;
      } catch (e) {
        console.error("Error during Kaplay cleanup:", e);
      }
    };
  }, []); // The empty array `[]` ensures this setup runs only once.

  return null;
}

