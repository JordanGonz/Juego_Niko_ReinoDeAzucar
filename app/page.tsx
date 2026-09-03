"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playTone } from "./game/audio";
import { FLOOR, GRAVITY, LEVELS, MAX_LIVES, PLAYER_HEIGHT, PLAYER_WIDTH, PROGRESS_KEY } from "./game/levels";
import { createEnemies, landPlayer, moveEnemy, overlapsEnemy } from "./game/physics";
import type { Biome, GamePower, GameState, Particle, Player, RuntimeEnemy } from "./game/types";
import { GameFooter, GameHud, GameOverlay, MobileControls, PowerBadge, WorldMap } from "./game/ui";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const raf = useRef(0);
  const command = useRef<{ type: "newGame" } | { type: "loadLevel"; index: number } | null>(null);
  const soundRef = useRef(true);
  const unlockedRef = useRef(0);
  const gameState = useRef<GameState>("ready");
  const [state, setState] = useState<GameState>("ready");
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinGoal, setCoinGoal] = useState(LEVELS[0].coins.length);
  const [lives, setLives] = useState(3);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [power, setPower] = useState<GamePower>("");
  const [sound, setSound] = useState(true);

  useEffect(() => { soundRef.current = sound; }, [sound]);
  useEffect(() => { gameState.current = state; }, [state]);
  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const saved = Number.parseInt(window.localStorage.getItem(PROGRESS_KEY) ?? "0", 10);
      const restored = Number.isFinite(saved) ? Math.max(0, Math.min(LEVELS.length - 1, saved)) : 0;
      unlockedRef.current = restored;
      setUnlockedLevel(restored);
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  const beep = useCallback((frequency: number, duration = 0.08) => {
    playTone(soundRef.current, frequency, duration);
  }, []);

  const startGame = useCallback(() => {
    keys.current = {};
    command.current = { type: "newGame" };
    setLevelIndex(0); setScore(0); setCoins(0); setCoinGoal(LEVELS[0].coins.length); setLives(3);
    setState("map"); gameState.current = "map";
    beep(520, 0.12);
  }, [beep]);

  const playLevel = useCallback((index: number) => {
    keys.current = {};
    command.current = { type: "loadLevel", index };
    setState("playing"); gameState.current = "playing";
    beep(620, 0.12);
  }, [beep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const isPortrait = window.innerWidth <= 760 && window.innerHeight > window.innerWidth;
      canvas.height = 540;
      canvas.width = isPortrait ? Math.max(320, Math.round(540 * (bounds.width / Math.max(bounds.height, 1)))) : 960;
    };
    resizeCanvas();

    const player: Player = { x: 100, y: FLOOR - PLAYER_HEIGHT, w: PLAYER_WIDTH, h: PLAYER_HEIGHT, vx: 0, vy: 0, grounded: true, facing: 1, inv: 0 };
    let activeLevel = 0;
    let level = LEVELS[activeLevel];
    let camera = 0;
    let localScore = 0;
    let localCoins = 0;
    let localLives = 3;
    let activePower: GamePower = "";
    let powerTimer = 0;
    let lastSafe = { x: 100, y: FLOOR - PLAYER_HEIGHT };
    let tick = 0;
    let finishTimer = 0;
    let finishTarget: "map" | "won" = "map";
    let particles: Particle[] = [];
    let coinList = level.coins.map(([x, y]) => ({ x, y, taken: false }));
    let pickupList = level.pickups.map(([x, y, type]) => ({ x, y, type, taken: false }));
    let enemies: RuntimeEnemy[] = [];

    const loadLevel = (index: number) => {
      activeLevel = index;
      level = LEVELS[index];
      player.x = 100; player.y = FLOOR - player.h; player.vx = 0; player.vy = 0;
      player.grounded = true; player.inv = 0; camera = 0;
      finishTimer = 0;
      lastSafe = { x: 100, y: FLOOR - player.h };
      localCoins = 0;
      activePower = ""; powerTimer = 0; setPower("");
      coinList = level.coins.map(([x, y]) => ({ x, y, taken: false }));
      pickupList = level.pickups.map(([x, y, type]) => ({ x, y, type, taken: false }));
      enemies = createEnemies(level);
      particles = [];
      setLevelIndex(index); setCoins(0); setCoinGoal(level.coins.length);
    };

    const resetGame = () => {
      localScore = 0; localLives = 3;
      setScore(0); setLives(3);
      loadLevel(0);
    };

    const burst = (x: number, y: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5, life: 30 + Math.random() * 25, color });
    };

    const primaryAction = () => {
      if (gameState.current !== "playing" && gameState.current !== "map") startGame();
    };
    const down = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
      if ((event.code === "Space" || event.code === "Enter") && gameState.current !== "playing") primaryAction();
    };
    const up = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("resize", resizeCanvas);

    const drawCloud = (x: number, y: number, scale: number) => {
      ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.beginPath(); ctx.arc(x, y, 24 * scale, 0, Math.PI * 2); ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
      ctx.arc(x + 62 * scale, y, 24 * scale, 0, Math.PI * 2); ctx.fill();
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, level.sky[0]); sky.addColorStop(0.48, level.sky[1]); sky.addColorStop(1, level.sky[2]);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);

      if (level.biome === "meadow") {
        ctx.fillStyle = "rgba(255,244,155,.9)"; ctx.beginPath(); ctx.arc(790, 86, 46, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 7; i++) drawCloud(((i * 260 - camera * 0.12) % 1500) - 120, 90 + (i % 3) * 65, 0.65 + (i % 2) * 0.25);
        ctx.fillStyle = "#9b5de5";
        for (let i = 0; i < 11; i++) {
          const x = i * 330 - (camera * 0.22 % 330) - 80;
          ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x + 140, 150 + (i % 3) * 40, x + 310, FLOOR); ctx.fill();
        }
        ctx.fillStyle = "#7146c5";
        for (let i = 0; i < 9; i++) {
          const x = i * 420 - (camera * 0.38 % 420) - 100;
          ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x + 180, 235 + (i % 2) * 45, x + 390, FLOOR); ctx.fill();
        }
        ctx.fillStyle = "#4c235f"; ctx.fillRect(0, FLOOR, width, height - FLOOR);
      } else if (level.biome === "canyon") {
        ctx.fillStyle = "rgba(255,218,88,.9)"; ctx.beginPath(); ctx.arc(760, 120, 78, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#a13e67";
        for (let i = 0; i < 7; i++) {
          const x = i * 260 - (camera * 0.18 % 260) - 60;
          const mesaHeight = 110 + (i % 3) * 38;
          ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 35, FLOOR - mesaHeight); ctx.lineTo(x + 150, FLOOR - mesaHeight); ctx.lineTo(x + 210, FLOOR); ctx.fill();
        }
        ctx.fillStyle = "#ff6b35"; ctx.fillRect(0, FLOOR, width, height - FLOOR);
        ctx.strokeStyle = "#ffd35a"; ctx.lineWidth = 5;
        for (let x = -20; x < width + 40; x += 60) { ctx.beginPath(); ctx.arc(x, FLOOR + 16 + Math.sin((tick + x) * 0.05) * 5, 26, Math.PI, 0); ctx.stroke(); }
      } else if (level.biome === "cave") {
        ctx.fillStyle = "#24143d";
        for (let x = -40; x < width + 80; x += 95) {
          const depth = 70 + ((x + 120) % 4) * 22;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 38, depth); ctx.lineTo(x + 76, 0); ctx.fill();
        }
        for (let i = 0; i < 18; i++) {
          const x = (i * 137 - camera * 0.08) % (width + 100);
          ctx.fillStyle = i % 2 ? "rgba(255,126,179,.55)" : "rgba(91,236,218,.55)";
          ctx.beginPath(); ctx.arc(x, 110 + (i * 73) % 250, 3 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = "#5a2735"; ctx.fillRect(0, FLOOR, width, height - FLOOR);
        ctx.fillStyle = "#bb5b4c";
        for (let x = 0; x < width; x += 55) { ctx.beginPath(); ctx.arc(x, FLOOR + 10 + Math.sin((tick + x) * 0.06) * 4, 22, Math.PI, 0); ctx.fill(); }
      } else {
        for (let i = 0; i < 36; i++) {
          ctx.fillStyle = i % 3 ? "rgba(255,255,255,.65)" : "rgba(117,247,231,.8)";
          ctx.fillRect((i * 113 - camera * 0.04) % (width + 30), 25 + (i * 67) % 300, 2 + (i % 2), 2 + (i % 2));
        }
        const aurora = ctx.createLinearGradient(0, 80, width, 330);
        aurora.addColorStop(0, "rgba(70,255,221,0)"); aurora.addColorStop(0.45, "rgba(70,255,221,.22)"); aurora.addColorStop(1, "rgba(255,91,205,0)");
        ctx.fillStyle = aurora; ctx.fillRect(0, 70, width, 260);
        ctx.fillStyle = "#342a83";
        for (let i = 0; i < 9; i++) {
          const x = i * 145 - (camera * 0.25 % 145);
          ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 65, 190 + (i % 3) * 35); ctx.lineTo(x + 130, FLOOR); ctx.fill();
        }
        ctx.fillStyle = "#17275f"; ctx.fillRect(0, FLOOR, width, height - FLOOR);
      }

      const platformPalette: Record<Biome, readonly [string, string, string, string]> = {
        meadow: ["#65e080", "#32bd68", "#9c5a42", "#60384a"],
        canyon: ["#ffd35a", "#f29b38", "#bc4f48", "#702e4d"],
        cave: ["#f08c9d", "#ba4c79", "#6a3153", "#351d3f"],
        crystal: ["#b9fff4", "#55d8df", "#5262bd", "#29265f"],
      };
      const palette = platformPalette[level.biome];

      ctx.save(); ctx.translate(-camera, 0);
      level.platforms.forEach(([x, y, w, h]) => {
        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(0.16, palette[1]);
        gradient.addColorStop(0.17, palette[2]); gradient.addColorStop(1, palette[3]);
        ctx.fillStyle = gradient; roundRect(ctx, x, y, w, h, 14); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.28)";
        for (let px = x + 25; px < x + w - 10; px += 55) { ctx.beginPath(); ctx.arc(px, y + 10, 4, 0, Math.PI * 2); ctx.fill(); }
      });

      coinList.forEach((coin, index) => {
        if (coin.taken) return;
        const pulse = 1 + Math.sin(tick * 0.12 + index) * 0.09;
        ctx.save(); ctx.translate(coin.x, coin.y); ctx.scale(pulse, 1);
        ctx.shadowColor = "#fff6a0"; ctx.shadowBlur = 18;
        ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fff3a5"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#f39c12"; ctx.fillRect(-2, -7, 4, 14); ctx.restore();
      });

      pickupList.forEach((pickup, index) => {
        if (pickup.taken) return;
        const bob = Math.sin(tick * 0.09 + index) * 5;
        ctx.save(); ctx.translate(pickup.x, pickup.y + bob);
        ctx.shadowColor = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "rgba(36,16,71,.78)"; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 23px Arial";
        ctx.fillStyle = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
        ctx.fillText(pickup.type === "heart" ? "♥" : pickup.type === "shield" ? "◆" : "⚡", 0, 1);
        ctx.restore();
      });

      enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        ctx.save(); ctx.translate(enemy.x, enemy.y);
        const enemyColors: Record<Biome, string> = { meadow: "#d83cff", canyon: "#e83f50", cave: "#ff7da8", crystal: "#5d65ef" };
        ctx.fillStyle = enemyColors[level.biome]; roundRect(ctx, -18, 0, 36, 31, 14); ctx.fill();
        ctx.fillStyle = "#8b1eb3"; ctx.beginPath(); ctx.arc(-10, 30, 7, 0, Math.PI * 2); ctx.arc(10, 30, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(-7, 11, 5, 0, Math.PI * 2); ctx.arc(7, 11, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#35104b"; ctx.beginPath(); ctx.arc(-6, 12, 2, 0, Math.PI * 2); ctx.arc(6, 12, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      const goalX = level.width - 150;
      ctx.fillStyle = "#ffda3d"; ctx.fillRect(goalX, 235, 14, 223);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(goalX + 7, 226, 18, 0, Math.PI * 2); ctx.fill();
      const flagWave = Math.sin(tick * 0.2) * (gameState.current === "finishing" ? 11 : 4);
      ctx.fillStyle = "#ff4e88"; ctx.beginPath(); ctx.moveTo(goalX + 14, 255); ctx.quadraticCurveTo(goalX + 62, 273 + flagWave, goalX + 110, 287); ctx.quadraticCurveTo(goalX + 62, 304 + flagWave, goalX + 14, 318); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "900 19px Arial"; ctx.fillText(activeLevel === LEVELS.length - 1 ? "TORRE" : "META", goalX + 35, 293);

      particles.forEach((particle) => {
        ctx.globalAlpha = Math.max(0, particle.life / 45); ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 4, particle.y - 4, 8, 8);
      }); ctx.globalAlpha = 1;

      ctx.save(); ctx.translate(player.x, player.y);
      if (activePower === "ESCUDO") {
        ctx.strokeStyle = `rgba(117,247,231,${0.55 + Math.sin(tick * 0.16) * 0.2})`;
        ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(19, 24, 31, 39, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (player.inv > 0 && Math.floor(player.inv / 4) % 2) ctx.globalAlpha = 0.25;
      ctx.scale(player.facing, 1);
      ctx.fillStyle = "#ff315f"; roundRect(ctx, -4, 3, 42, 18, 8); ctx.fill();
      ctx.fillStyle = "#21d4c2"; roundRect(ctx, 2, 18, 34, 30, 11); ctx.fill();
      ctx.fillStyle = "#ffd9a3"; ctx.beginPath(); ctx.arc(19, 12, 17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#42205f"; ctx.beginPath(); ctx.arc(19, 6, 18, Math.PI, Math.PI * 2); ctx.lineTo(36, 8); ctx.fill();
      ctx.fillStyle = "#ffe95c"; roundRect(ctx, 3, -3, 34, 10, 5); ctx.fill();
      ctx.fillStyle = "#2b1851"; ctx.beginPath(); ctx.arc(24, 12, 2.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6c3ab8"; ctx.fillRect(4, 43, 13, 7); ctx.fillRect(25, 43, 13, 7);
      ctx.restore(); ctx.restore();

      if (gameState.current === "finishing") {
        const reveal = Math.min(1, finishTimer / 18);
        const lift = Math.sin(Math.min(1, finishTimer / 40) * Math.PI) * 12;
        ctx.save();
        ctx.globalAlpha = reveal;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(36,16,71,.45)"; ctx.shadowBlur = 18;
        ctx.fillStyle = "#fff"; ctx.font = "1000 58px Arial";
        ctx.fillText("¡META!", width / 2, 130 - lift);
        ctx.fillStyle = "#ffe047"; ctx.font = "900 18px Arial";
        ctx.fillText(`CAPÍTULO ${activeLevel + 1} COMPLETADO`, width / 2, 163 - lift);
        ctx.restore();
      }

      const vignette = ctx.createRadialGradient(width / 2, height / 2, 190, width / 2, height / 2, 650);
      vignette.addColorStop(0.55, "rgba(26,12,58,0)"); vignette.addColorStop(1, "rgba(26,12,58,.34)");
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
    };

    const loseLife = () => {
      localLives--; setLives(localLives); beep(90, 0.2);
      if (localLives <= 0) {
        setState("lost"); gameState.current = "lost";
        return;
      }
      player.x = lastSafe.x; player.y = lastSafe.y - 8; player.vx = 0; player.vy = 0; player.inv = 90;
      camera = Math.max(0, Math.min(level.width - canvas.width, player.x - 280));
    };

    const update = () => {
      tick++;
      if (command.current?.type === "newGame") { resetGame(); command.current = null; }
      if (command.current?.type === "loadLevel") {
        const requestedLevel = command.current.index;
        command.current = null;
        loadLevel(requestedLevel);
      }

      if (gameState.current === "playing") {
        const left = keys.current.ArrowLeft || keys.current.KeyA;
        const right = keys.current.ArrowRight || keys.current.KeyD;
        const jump = keys.current.ArrowUp || keys.current.KeyW || keys.current.Space;
        const maxSpeed = activePower === "TURBO" ? 8.2 : 6;
        if (left) { player.vx = Math.max(player.vx - 0.7, -maxSpeed); player.facing = -1; }
        else if (right) { player.vx = Math.min(player.vx + 0.7, maxSpeed); player.facing = 1; }
        else player.vx *= level.friction;
        if (jump && player.grounded) { player.vy = -(level.jumpForce + (activePower === "TURBO" ? 1.8 : 0)); player.grounded = false; beep(310, 0.08); }

        player.vy += GRAVITY;
        const oldBottom = player.y + player.h;
        player.x += player.vx; player.y += player.vy;
        player.x = Math.max(0, Math.min(level.width - player.w, player.x));
        player.grounded = false;
        const landing = landPlayer(player, level, oldBottom);
        if (landing && landing.y === FLOOR && landing.footCenter > landing.x + 42 && landing.footCenter < landing.x + landing.width - 42) {
          lastSafe = { x: Math.max(landing.x + 24, Math.min(landing.x + landing.width - player.w - 24, player.x)), y: landing.y - player.h };
        }

        coinList.forEach((coin) => {
          if (!coin.taken && Math.hypot(player.x + 20 - coin.x, player.y + 22 - coin.y) < 32) {
            coin.taken = true; localCoins++; localScore += 100;
            setCoins(localCoins); setScore(localScore); burst(coin.x, coin.y, "#ffe75b", 8); beep(720, 0.07);
          }
        });

        pickupList.forEach((pickup) => {
          if (pickup.taken || Math.hypot(player.x + 20 - pickup.x, player.y + 24 - pickup.y) >= 38) return;
          pickup.taken = true;
          if (pickup.type === "heart") {
            if (localLives < MAX_LIVES) { localLives++; setLives(localLives); }
            else { localScore += 300; setScore(localScore); }
            burst(pickup.x, pickup.y, "#ff557c", 18); beep(940, 0.14);
          } else {
            activePower = pickup.type === "shield" ? "ESCUDO" : "TURBO";
            powerTimer = pickup.type === "shield" ? 720 : 600;
            setPower(activePower);
            burst(pickup.x, pickup.y, pickup.type === "shield" ? "#75f7e7" : "#ffe047", 20); beep(820, 0.18);
          }
        });

        enemies.forEach((enemy) => {
          if (!enemy.alive) return;
          moveEnemy(enemy);
          const hit = overlapsEnemy(player, enemy);
          if (hit && player.vy > 2 && player.y + player.h < enemy.y + 18) {
            enemy.alive = false; player.vy = -9; localScore += 250; setScore(localScore);
            burst(enemy.x, enemy.y, "#f16aff", 14); beep(170, 0.1);
          } else if (hit && player.inv <= 0) {
            player.inv = 100; player.vy = -8; player.vx = -player.facing * 7;
            if (activePower === "ESCUDO") {
              activePower = ""; powerTimer = 0; setPower("");
              burst(player.x, player.y, "#75f7e7", 22); beep(240, 0.18);
            } else {
              localLives--; setLives(localLives); burst(player.x, player.y, "#ff557c", 12); beep(110, 0.18);
              if (localLives <= 0) { setState("lost"); gameState.current = "lost"; }
            }
          }
        });

        if (player.inv > 0) player.inv--;
        if (powerTimer > 0) {
          powerTimer--;
          if (powerTimer === 0) { activePower = ""; setPower(""); }
        }
        if (player.y > 580) loseLife();

        if (player.x > level.width - 205) {
          localScore += localLives * 500; setScore(localScore);
          burst(level.width - 140, 250, "#fff06a", 55); beep(880, 0.4);
          finishTimer = 0;
          finishTarget = activeLevel === LEVELS.length - 1 ? "won" : "map";
          const nextUnlocked = Math.max(unlockedRef.current, Math.min(activeLevel + 1, LEVELS.length - 1));
          unlockedRef.current = nextUnlocked;
          setUnlockedLevel(nextUnlocked);
          window.localStorage.setItem(PROGRESS_KEY, String(nextUnlocked));
          player.vx = 0; player.vy = -7;
          keys.current = {};
          setState("finishing"); gameState.current = "finishing";
        }
        camera += ((player.x - 280) - camera) * 0.08;
        camera = Math.max(0, Math.min(level.width - canvas.width, camera));
      }

      if (gameState.current === "finishing") {
        finishTimer++;
        player.vy += 0.42;
        player.y += player.vy;
        if (player.y + player.h >= FLOOR) {
          player.y = FLOOR - player.h;
          player.vy = finishTimer < 52 ? -5.5 : 0;
        }
        if (finishTimer % 9 === 0) {
          const colors = ["#fff06a", "#ff4e88", "#76f3dc", "#ffffff"];
          burst(level.width - 250 + Math.random() * 230, 180 + Math.random() * 170, colors[Math.floor(Math.random() * colors.length)], 9);
        }
        if (finishTimer >= 96) {
          setState(finishTarget); gameState.current = finishTarget;
        }
      }

      particles.forEach((particle) => { particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.18; particle.life--; });
      particles = particles.filter((particle) => particle.life > 0);
      draw();
      raf.current = requestAnimationFrame(update);
    };

    enemies = createEnemies(level);
    update();
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", down); window.removeEventListener("keyup", up);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [beep, startGame]);

  const touch = (key: string, pressed: boolean) => { keys.current[key] = pressed; };
  const level = LEVELS[levelIndex];

  return (
    <main className="game-shell">
      <GameHud state={state} levelIndex={levelIndex} unlockedLevel={unlockedLevel} score={score} coins={coins} coinGoal={coinGoal} lives={lives} sound={sound} onToggleSound={() => setSound((value) => !value)} />
      <section className="stage" aria-label={`Nivel ${levelIndex + 1}: ${level.name}`}>
        <canvas ref={canvasRef} width={960} height={540} />
        {state === "playing" && <PowerBadge power={power} />}
        {state === "map" && <WorldMap unlockedLevel={unlockedLevel} onPlay={playLevel} />}
        {state !== "playing" && state !== "finishing" && state !== "map" && <GameOverlay state={state} score={score} onStart={startGame} />}
        {state === "playing" && <MobileControls onTouch={touch} />}
      </section>
      <GameFooter state={state} levelIndex={levelIndex} level={level} />
    </main>
  );
}
