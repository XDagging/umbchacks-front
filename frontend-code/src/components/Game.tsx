// src/components/Game.tsx
import React, { useRef, useEffect, useState } from "react";
import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";

export default function Game() {
  const hasGameStarted = useRef<any>(null);

  const [playerStats, setPlayerStats] = useState({
    age: 0,
    health: 100,
    money: 0,
    description: "A new player",
  });

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

    hasGameStarted.current = k;
    k.canvas.style.position = "absolute";
    k.canvas.style.top = "0px";
    k.canvas.style.left = "0px";

    // Assets
    k.loadCrew("sprite", "apple");
    k.loadCrew("sprite", "grape", "purplefruit");
    k.loadCrew("font", "happy");

    // ----- HUD (fixed to screen space) -----
    const BAR_HEIGHT = 100;
    const MARGIN = 50;

    k.add([
      k.rect(k.width() - MARGIN * 2, BAR_HEIGHT),
      k.pos(MARGIN, k.height() - BAR_HEIGHT - MARGIN),
      k.fixed(),
      k.color(50, 50, 50),
    ]);

    k.add([
      k.text("Age: 18", { size: 24 }),
      k.pos(MARGIN + 20, k.height() - BAR_HEIGHT - MARGIN + 20),
      k.color(255, 255, 255),
      k.fixed(),
    ]);

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
    const innerX = worldX + BORDER_THICK;
    const innerY = worldY + BORDER_THICK;
    const innerW = worldW - BORDER_THICK * 2;
    const innerH = worldH - BORDER_THICK * 2;

    // World fill
    k.add([
      k.rect(innerW, innerH),
      k.pos(innerX, innerY),
      k.color(20, 40, 60),
    ]);

    // ----- GRID AESTHETIC -----
    // Draw light grid lines inside the world
    const GRID = 64; // cell size
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
        k.pos(innerX, Math.floor(y)),
        k.color(70, 90, 110),
        // k.opacity(0.25),
      ]);
    }

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

    const mainCharacter = k.add([
      k.sprite("apple"),
      k.area(),
      k.pos(worldX + worldW / 2, worldY + worldH / 2),
      k.anchor("center"),
    ]);

    // Input
    k.onKeyDown("w", () => mainCharacter.move(0, -SPEED));
    k.onKeyDown("a", () => mainCharacter.move(-SPEED, 0));
    k.onKeyDown("s", () => mainCharacter.move(0, SPEED));
    k.onKeyDown("d", () => mainCharacter.move(SPEED, 0));

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
