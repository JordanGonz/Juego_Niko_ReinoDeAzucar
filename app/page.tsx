"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameState = "ready" | "playing" | "won" | "lost";

const WORLD_WIDTH = 6200;
const FLOOR = 458;
const GRAVITY = 0.75;

const platforms = [
  [0, FLOOR, 740, 82], [820, FLOOR, 690, 82], [1610, FLOOR, 570, 82],
  [2280, FLOOR, 860, 82], [3240, FLOOR, 550, 82], [3890, FLOOR, 970, 82],
  [4970, FLOOR, 1230, 82], [340, 354, 160, 28], [580, 278, 150, 28],
  [900, 358, 160, 28], [1160, 290, 150, 28], [1690, 345, 150, 28],
  [1940, 265, 160, 28], [2370, 345, 180, 28], [2680, 278, 170, 28],
  [2950, 205, 170, 28], [3320, 350, 160, 28], [3530, 275, 160, 28],
  [4000, 348, 170, 28], [4320, 275, 180, 28], [4640, 198, 180, 28],
  [5100, 345, 180, 28], [5420, 270, 170, 28],
] as const;

const coinSeeds = [
  [390, 310], [460, 310], [620, 230], [690, 230], [950, 310], [1220, 242],
  [1280, 242], [1740, 295], [1990, 215], [2050, 215], [2410, 295], [2490, 295],
  [2715, 228], [2780, 228], [2985, 155], [3055, 155], [3365, 300], [3575, 225],
  [4045, 298], [4120, 298], [4370, 225], [4700, 148], [4760, 148], [5150, 295],
  [5220, 295], [5470, 220], [5540, 220], [5750, 390], [5830, 390],
] as const;

const enemySeeds = [680, 1060, 1430, 1820, 2470, 3050, 3450, 4180, 4800, 5320, 5780];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const raf = useRef(0);
  const [state, setState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [sound, setSound] = useState(true);
  const gameState = useRef<GameState>("ready");

  const beep = useCallback((frequency: number, duration = 0.08) => {
    if (!sound) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audio = new AudioContextClass();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.09, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch {}
  }, [sound]);

  const start = useCallback(() => {
    setScore(0); setCoins(0); setLives(3);
    setState("playing"); gameState.current = "playing";
    beep(520, 0.12);
  }, [beep]);

  useEffect(() => { gameState.current = state; }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const player = { x: 100, y: 380, w: 38, h: 50, vx: 0, vy: 0, grounded: false, facing: 1, inv: 0 };
    let camera = 0;
    let localScore = 0;
    let localCoins = 0;
    let localLives = 3;
    let tick = 0;
    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
    let coinList = coinSeeds.map(([x, y]) => ({ x, y, taken: false }));
    let enemies = enemySeeds.map((x, i) => ({ x, y: FLOOR - 34, vx: i % 2 ? -1.15 : 1.15, alive: true }));

    const resetWorld = () => {
      player.x = 100; player.y = 380; player.vx = 0; player.vy = 0; camera = 0;
      coinList = coinSeeds.map(([x, y]) => ({ x, y, taken: false }));
      enemies = enemySeeds.map((x, i) => ({ x, y: FLOOR - 34, vx: i % 2 ? -1.15 : 1.15, alive: true }));
    };

    const burst = (x: number, y: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) particles.push({
        x, y, vx: (Math.random() - .5) * 6, vy: -Math.random() * 5,
        life: 30 + Math.random() * 25, color,
      });
    };

    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) e.preventDefault();
      if ((e.code === "Space" || e.code === "Enter") && gameState.current !== "playing") start();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const drawCloud = (x: number, y: number, s: number) => {
      ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.beginPath(); ctx.arc(x, y, 24*s, 0, Math.PI*2); ctx.arc(x+30*s, y-10*s, 30*s, 0, Math.PI*2);
      ctx.arc(x+62*s, y, 24*s, 0, Math.PI*2); ctx.fill();
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#7657ff"); sky.addColorStop(.48, "#fc7dc9"); sky.addColorStop(1, "#ffd887");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,244,155,.9)"; ctx.beginPath(); ctx.arc(790, 86, 46, 0, Math.PI*2); ctx.fill();
      for (let i = 0; i < 7; i++) drawCloud(((i * 260 - camera * .12) % 1500) - 120, 90 + (i % 3)*65, .65 + (i%2)*.25);

      ctx.fillStyle = "#9b5de5";
      for (let i = 0; i < 11; i++) {
        const x = i * 330 - (camera * .22 % 330) - 80;
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x+140, 150+(i%3)*40, x+310, FLOOR); ctx.fill();
      }
      ctx.fillStyle = "#7146c5";
      for (let i = 0; i < 9; i++) {
        const x = i * 420 - (camera * .38 % 420) - 100;
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x+180, 235+(i%2)*45, x+390, FLOOR); ctx.fill();
      }

      ctx.save(); ctx.translate(-camera, 0);
      platforms.forEach(([x, y, w, h]) => {
        const g = ctx.createLinearGradient(0, y, 0, y+h);
        g.addColorStop(0, "#65e080"); g.addColorStop(.16, "#32bd68"); g.addColorStop(.17, "#9c5a42"); g.addColorStop(1, "#60384a");
        ctx.fillStyle = g; roundRect(ctx, x, y, w, h, 14); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.28)";
        for (let px=x+25; px<x+w-10; px+=55) { ctx.beginPath(); ctx.arc(px, y+10, 4, 0, Math.PI*2); ctx.fill(); }
      });

      coinList.forEach((c, i) => {
        if (c.taken) return;
        const pulse = 1 + Math.sin(tick*.12+i)*.09;
        ctx.save(); ctx.translate(c.x, c.y); ctx.scale(pulse, 1);
        ctx.shadowColor = "#fff6a0"; ctx.shadowBlur = 18;
        ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#fff3a5"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#f39c12"; ctx.fillRect(-2, -7, 4, 14); ctx.restore();
      });

      enemies.forEach((e) => {
        if (!e.alive) return;
        ctx.save(); ctx.translate(e.x, e.y);
        ctx.fillStyle = "#d83cff"; roundRect(ctx, -18, 0, 36, 31, 14); ctx.fill();
        ctx.fillStyle = "#8b1eb3"; ctx.beginPath(); ctx.arc(-10, 30, 7, 0, Math.PI*2); ctx.arc(10, 30, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(-7, 11, 5, 0, Math.PI*2); ctx.arc(7, 11, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#35104b"; ctx.beginPath(); ctx.arc(-6, 12, 2, 0, Math.PI*2); ctx.arc(6, 12, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Goal gate
      ctx.fillStyle = "#ffda3d"; ctx.fillRect(6010, 235, 14, 223);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(6017, 226, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ff4e88"; ctx.beginPath(); ctx.moveTo(6024, 255); ctx.lineTo(6120, 287); ctx.lineTo(6024, 318); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "900 19px Arial"; ctx.fillText("META", 6045, 293);

      particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life/45); ctx.fillStyle = p.color;
        ctx.fillRect(p.x-4, p.y-4, 8, 8);
      }); ctx.globalAlpha = 1;

      // Hero: Niko, the cosmic courier
      ctx.save(); ctx.translate(player.x, player.y);
      if (player.inv > 0 && Math.floor(player.inv/4)%2) ctx.globalAlpha = .25;
      ctx.scale(player.facing, 1);
      ctx.fillStyle = "#ff315f"; roundRect(ctx, -4, 3, 42, 18, 8); ctx.fill(); // scarf
      ctx.fillStyle = "#21d4c2"; roundRect(ctx, 2, 18, 34, 30, 11); ctx.fill();
      ctx.fillStyle = "#ffd9a3"; ctx.beginPath(); ctx.arc(19, 12, 17, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#42205f"; ctx.beginPath(); ctx.arc(19, 6, 18, Math.PI, Math.PI*2); ctx.lineTo(36, 8); ctx.fill();
      ctx.fillStyle = "#ffe95c"; roundRect(ctx, 3, -3, 34, 10, 5); ctx.fill();
      ctx.fillStyle = "#2b1851"; ctx.beginPath(); ctx.arc(24, 12, 2.7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#6c3ab8"; ctx.fillRect(4, 43, 13, 7); ctx.fillRect(25, 43, 13, 7);
      ctx.restore();
      ctx.restore();

      // vignette
      const v = ctx.createRadialGradient(W/2,H/2,190,W/2,H/2,650);
      v.addColorStop(.55,"rgba(26,12,58,0)"); v.addColorStop(1,"rgba(26,12,58,.34)");
      ctx.fillStyle=v; ctx.fillRect(0,0,W,H);
    };

    const update = () => {
      tick++;
      if (gameState.current === "playing") {
        const left = keys.current.ArrowLeft || keys.current.KeyA;
        const right = keys.current.ArrowRight || keys.current.KeyD;
        const jump = keys.current.ArrowUp || keys.current.KeyW || keys.current.Space;
        if (left) { player.vx = Math.max(player.vx-.7, -6); player.facing = -1; }
        else if (right) { player.vx = Math.min(player.vx+.7, 6); player.facing = 1; }
        else player.vx *= .78;
        if (jump && player.grounded) { player.vy = -13.8; player.grounded = false; beep(310, .08); }
        player.vy += GRAVITY;
        const oldBottom = player.y + player.h;
        player.x += player.vx; player.y += player.vy;
        player.x = Math.max(0, Math.min(WORLD_WIDTH-player.w, player.x));
        player.grounded = false;
        for (const [x,y,w] of platforms) {
          if (player.x+player.w > x && player.x < x+w && oldBottom <= y+4 && player.y+player.h >= y && player.vy >= 0) {
            player.y = y-player.h; player.vy = 0; player.grounded = true;
          }
        }
        coinList.forEach(c => {
          if (!c.taken && Math.hypot(player.x+20-c.x, player.y+22-c.y)<32) {
            c.taken=true; localCoins++; localScore+=100; setCoins(localCoins); setScore(localScore);
            burst(c.x,c.y,"#ffe75b",8); beep(720,.07);
          }
        });
        enemies.forEach(e => {
          if (!e.alive) return;
          e.x += e.vx;
          if (e.x < 80 || e.x > WORLD_WIDTH-80) e.vx *= -1;
          const hit = player.x+player.w>e.x-18 && player.x<e.x+18 && player.y+player.h>e.y && player.y<e.y+34;
          if (hit && player.vy>2 && player.y+player.h<e.y+18) {
            e.alive=false; player.vy=-9; localScore+=250; setScore(localScore);
            burst(e.x,e.y,"#f16aff",14); beep(170,.1);
          } else if (hit && player.inv<=0) {
            localLives--; setLives(localLives); player.inv=100; player.vy=-8; player.vx=-player.facing*7;
            burst(player.x,player.y,"#ff557c",12); beep(110,.18);
            if (localLives<=0) { setState("lost"); gameState.current="lost"; }
          }
        });
        if (player.inv>0) player.inv--;
        particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--;});
        particles=particles.filter(p=>p.life>0);
        if (player.y>580) {
          localLives--; setLives(localLives); beep(90,.2);
          if (localLives<=0) { setState("lost"); gameState.current="lost"; }
          else { player.x=Math.max(60,camera+100); player.y=250; player.vy=0; }
        }
        if (player.x>5960) {
          localScore += localLives*500; setScore(localScore); setState("won"); gameState.current="won";
          burst(6020,250,"#fff06a",40); beep(880,.4);
        }
        camera += ((player.x-280)-camera)*.08;
        camera = Math.max(0,Math.min(WORLD_WIDTH-canvas.width,camera));
      }
      draw();
      raf.current=requestAnimationFrame(update);
    };
    resetWorld(); update();
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown",down); window.removeEventListener("keyup",up);
    };
  }, [beep, start]);

  const touch = (key: string, pressed: boolean) => { keys.current[key] = pressed; };

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">N</span>
          <div><strong>NIKO</strong><span>y el Reino de Azúcar</span></div>
        </div>
        <div className="hud">
          <span><small>PUNTOS</small>{score.toString().padStart(6,"0")}</span>
          <span><small>MONEDAS</small>✦ {coins}/29</span>
          <span><small>VIDAS</small>{"♥".repeat(Math.max(0,lives))}</span>
        </div>
        <button className="sound" onClick={()=>setSound(v=>!v)} aria-label={sound ? "Silenciar" : "Activar sonido"}>
          {sound ? "♫" : "×"}
        </button>
      </header>

      <section className="stage" aria-label="Juego de plataformas Niko y el Reino de Azúcar">
        <canvas ref={canvasRef} width={960} height={540} />
        {state !== "playing" && (
          <div className="overlay">
            <div className="eyebrow">{state === "ready" ? "UNA AVENTURA DULCEMENTE PELIGROSA" : state === "won" ? "¡REINO SALVADO!" : "LA MAGIA SE AGOTÓ"}</div>
            <h1>{state === "ready" ? <>Corre. Salta.<br/><em>Brilla.</em></> : state === "won" ? <>¡Misión<br/><em>cumplida!</em></> : <>Inténtalo<br/><em>otra vez.</em></>}</h1>
            <p>{state === "ready" ? "Ayuda a Niko a recuperar las estrellas de azúcar antes de que los Glups morados se las coman todas." : state === "won" ? `Conseguiste ${coins} estrellas y ${score} puntos.` : `Tu puntuación fue ${score}. El reino todavía te necesita.`}</p>
            <button className="play" onClick={start}>{state === "ready" ? "JUGAR AHORA" : "VOLVER A JUGAR"} <span>→</span></button>
            <div className="controls"><kbd>←</kbd><kbd>→</kbd> mover <kbd>ESPACIO</kbd> saltar</div>
          </div>
        )}
        <div className="mobile-controls">
          <button aria-label="Mover a la izquierda" onPointerDown={()=>touch("ArrowLeft",true)} onPointerUp={()=>touch("ArrowLeft",false)} onPointerLeave={()=>touch("ArrowLeft",false)}>←</button>
          <button aria-label="Mover a la derecha" onPointerDown={()=>touch("ArrowRight",true)} onPointerUp={()=>touch("ArrowRight",false)} onPointerLeave={()=>touch("ArrowRight",false)}>→</button>
          <button className="jump" aria-label="Saltar" onPointerDown={()=>touch("Space",true)} onPointerUp={()=>touch("Space",false)} onPointerLeave={()=>touch("Space",false)}>↑</button>
        </div>
      </section>
      <footer><span>CAPÍTULO 01</span><b>VALLE DE LOS MIL SABORES</b><span>LLEGA A LA BANDERA ✦</span></footer>
    </main>
  );
}
