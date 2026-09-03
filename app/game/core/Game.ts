import { playTone } from "../audio";
import { Camera } from "../camera/Camera";
import { FLOOR, GRAVITY, LEVELS, MAX_LIVES, PLAYER_HEIGHT, PLAYER_WIDTH, PROGRESS_KEY } from "../levels";
import { landPlayer, overlapsEnemy } from "../physics/collision";
import { clampPlayerX, createEnemies, moveEnemy } from "../physics/movement";
import { GameRenderer } from "../rendering/GameRenderer";
import type { GameEvent, GamePower, GameState, Particle, Player, RuntimeCoin, RuntimeEnemy, RuntimePickup } from "../types";
import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { createInitialSession, nextUnlockedLevel } from "./session";

type GameCommand = { type: "newGame" } | { type: "loadLevel"; index: number };

export class Game {
  private readonly renderer: GameRenderer;
  private readonly input: InputManager;
  private readonly loop: GameLoop;
  private readonly camera = new Camera();
  private readonly player: Player = {
    x: 100, y: FLOOR - PLAYER_HEIGHT, w: PLAYER_WIDTH, h: PLAYER_HEIGHT,
    vx: 0, vy: 0, grounded: true, facing: 1, inv: 0,
  };
  private state: GameState = "ready";
  private activeLevel = 0;
  private level = LEVELS[0];
  private score = 0;
  private coins = 0;
  private lives = 3;
  private unlockedLevel = 0;
  private activePower: GamePower = "";
  private powerTimer = 0;
  private lastSafe = { x: 100, y: FLOOR - PLAYER_HEIGHT };
  private tick = 0;
  private finishTimer = 0;
  private finishTarget: "map" | "won" = "map";
  private particles: Particle[] = [];
  private coinList: RuntimeCoin[] = this.level.coins.map(([x, y]) => ({ x, y, taken: false }));
  private pickupList: RuntimePickup[] = this.level.pickups.map(([x, y, type]) => ({ x, y, type, taken: false }));
  private enemies: RuntimeEnemy[] = createEnemies(this.level);
  private command: GameCommand | null = null;
  private sound = true;
  private debug = false;
  private fps = 0;
  private fpsFrames = 0;
  private fpsStartedAt = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly emit: (event: GameEvent) => void,
  ) {
    this.renderer = new GameRenderer(canvas);
    this.input = new InputManager({
      onPrimaryAction: () => this.primaryAction(),
      onToggleDebug: () => { this.debug = !this.debug; },
    });
    this.loop = new GameLoop((timestamp) => this.update(timestamp));
  }

  start() {
    const saved = Number.parseInt(window.localStorage.getItem(PROGRESS_KEY) ?? "0", 10);
    this.unlockedLevel = Number.isFinite(saved) ? Math.max(0, Math.min(LEVELS.length - 1, saved)) : 0;
    this.emit({ type: "unlockedLevelChanged", value: this.unlockedLevel });
    this.renderer.resize();
    window.addEventListener("resize", this.resize);
    this.input.attach();
    this.fpsStartedAt = performance.now();
    this.loop.start();
  }

  destroy() {
    this.loop.stop();
    this.input.detach();
    window.removeEventListener("resize", this.resize);
  }

  newGame() {
    this.input.clear();
    this.command = { type: "newGame" };
    this.setScore(0); this.setLives(3); this.setCoins(0);
    this.emit({ type: "levelChanged", value: 0, coinGoal: LEVELS[0].coins.length });
    this.setState("map");
    this.beep(520, 0.12);
  }

  playLevel(index: number) {
    this.input.clear();
    this.command = { type: "loadLevel", index };
    this.setState("playing");
    this.beep(620, 0.12);
  }

  setTouch(code: string, pressed: boolean) {
    this.input.setTouch(code, pressed);
  }

  setSound(enabled: boolean) {
    this.sound = enabled;
  }

  private resize = () => this.renderer.resize();

  private primaryAction() {
    if (this.state !== "playing" && this.state !== "map") this.newGame();
  }

  private loadLevel(index: number) {
    this.activeLevel = index;
    this.level = LEVELS[index];
    this.player.x = 100; this.player.y = FLOOR - this.player.h; this.player.vx = 0; this.player.vy = 0;
    this.player.grounded = true; this.player.inv = 0; this.camera.reset();
    this.finishTimer = 0;
    this.lastSafe = { x: 100, y: FLOOR - this.player.h };
    this.setCoins(0);
    this.activePower = ""; this.powerTimer = 0; this.emit({ type: "powerChanged", value: "" });
    this.coinList = this.level.coins.map(([x, y]) => ({ x, y, taken: false }));
    this.pickupList = this.level.pickups.map(([x, y, type]) => ({ x, y, type, taken: false }));
    this.enemies = createEnemies(this.level);
    this.particles = [];
    this.emit({ type: "levelChanged", value: index, coinGoal: this.level.coins.length });
  }

  private resetGame() {
    const session = createInitialSession();
    this.setScore(session.score); this.setLives(session.lives);
    this.loadLevel(session.levelIndex);
  }

  private burst(x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5,
        life: 30 + Math.random() * 25,
        color,
      });
    }
  }

  private update(timestamp: number) {
    this.updateFps(timestamp);
    this.tick++;
    if (this.command?.type === "newGame") { this.resetGame(); this.command = null; }
    if (this.command?.type === "loadLevel") {
      const requestedLevel = this.command.index;
      this.command = null;
      this.loadLevel(requestedLevel);
    }

    if (this.state === "playing") this.updatePlaying();
    if (this.state === "finishing") this.updateFinishing();

    this.particles.forEach((particle) => {
      particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.18; particle.life--;
    });
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.renderer.render({
      level: this.level,
      activeLevel: this.activeLevel,
      state: this.state,
      player: this.player,
      enemies: this.enemies,
      coins: this.coinList,
      pickups: this.pickupList,
      particles: this.particles,
      activePower: this.activePower,
      cameraX: this.camera.x,
      tick: this.tick,
      finishTimer: this.finishTimer,
      debug: this.debug,
      fps: this.fps,
    });
  }

  private updatePlaying() {
    const left = this.input.isDown("ArrowLeft", "KeyA");
    const right = this.input.isDown("ArrowRight", "KeyD");
    const jump = this.input.isDown("ArrowUp", "KeyW", "Space");
    const maxSpeed = this.activePower === "TURBO" ? 8.2 : 6;
    if (left) { this.player.vx = Math.max(this.player.vx - 0.7, -maxSpeed); this.player.facing = -1; }
    else if (right) { this.player.vx = Math.min(this.player.vx + 0.7, maxSpeed); this.player.facing = 1; }
    else this.player.vx *= this.level.friction;
    if (jump && this.player.grounded) {
      this.player.vy = -(this.level.jumpForce + (this.activePower === "TURBO" ? 1.8 : 0));
      this.player.grounded = false; this.beep(310, 0.08);
    }

    this.player.vy += GRAVITY;
    const oldBottom = this.player.y + this.player.h;
    this.player.x += this.player.vx; this.player.y += this.player.vy;
    this.player.x = clampPlayerX(this.player.x, this.player.w, this.level.width);
    this.player.grounded = false;
    const landing = landPlayer(this.player, this.level, oldBottom);
    if (landing && landing.y === FLOOR && landing.footCenter > landing.x + 42 && landing.footCenter < landing.x + landing.width - 42) {
      this.lastSafe = {
        x: Math.max(landing.x + 24, Math.min(landing.x + landing.width - this.player.w - 24, this.player.x)),
        y: landing.y - this.player.h,
      };
    }

    this.collectCoins();
    this.collectPickups();
    this.updateEnemies();

    if (this.player.inv > 0) this.player.inv--;
    if (this.powerTimer > 0) {
      this.powerTimer--;
      if (this.powerTimer === 0) { this.activePower = ""; this.emit({ type: "powerChanged", value: "" }); }
    }
    if (this.player.y > 580) this.loseLife();

    if (this.player.x > this.level.width - 205) this.finishLevel();
    this.camera.follow(this.player.x, this.level.width, this.canvas.width);
  }

  private collectCoins() {
    this.coinList.forEach((coin) => {
      if (!coin.taken && Math.hypot(this.player.x + 20 - coin.x, this.player.y + 22 - coin.y) < 32) {
        coin.taken = true; this.setCoins(this.coins + 1); this.setScore(this.score + 100);
        this.burst(coin.x, coin.y, "#ffe75b", 8); this.beep(720, 0.07);
      }
    });
  }

  private collectPickups() {
    this.pickupList.forEach((pickup) => {
      if (pickup.taken || Math.hypot(this.player.x + 20 - pickup.x, this.player.y + 24 - pickup.y) >= 38) return;
      pickup.taken = true;
      if (pickup.type === "heart") {
        if (this.lives < MAX_LIVES) this.setLives(this.lives + 1);
        else this.setScore(this.score + 300);
        this.burst(pickup.x, pickup.y, "#ff557c", 18); this.beep(940, 0.14);
      } else {
        this.activePower = pickup.type === "shield" ? "ESCUDO" : "TURBO";
        this.powerTimer = pickup.type === "shield" ? 720 : 600;
        this.emit({ type: "powerChanged", value: this.activePower });
        this.burst(pickup.x, pickup.y, pickup.type === "shield" ? "#75f7e7" : "#ffe047", 20);
        this.beep(820, 0.18);
      }
    });
  }

  private updateEnemies() {
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      moveEnemy(enemy);
      const hit = overlapsEnemy(this.player, enemy);
      if (hit && this.player.vy > 2 && this.player.y + this.player.h < enemy.y + 18) {
        enemy.alive = false; this.player.vy = -9; this.setScore(this.score + 250);
        this.burst(enemy.x, enemy.y, "#f16aff", 14); this.beep(170, 0.1);
      } else if (hit && this.player.inv <= 0) {
        this.player.inv = 100; this.player.vy = -8; this.player.vx = -this.player.facing * 7;
        if (this.activePower === "ESCUDO") {
          this.activePower = ""; this.powerTimer = 0; this.emit({ type: "powerChanged", value: "" });
          this.burst(this.player.x, this.player.y, "#75f7e7", 22); this.beep(240, 0.18);
        } else {
          this.setLives(this.lives - 1); this.burst(this.player.x, this.player.y, "#ff557c", 12); this.beep(110, 0.18);
          if (this.lives <= 0) this.setState("lost");
        }
      }
    });
  }

  private loseLife() {
    this.setLives(this.lives - 1); this.beep(90, 0.2);
    if (this.lives <= 0) { this.setState("lost"); return; }
    this.player.x = this.lastSafe.x; this.player.y = this.lastSafe.y - 8;
    this.player.vx = 0; this.player.vy = 0; this.player.inv = 90;
    this.camera.respawn(this.player.x, this.level.width, this.canvas.width);
  }

  private finishLevel() {
    this.setScore(this.score + this.lives * 500);
    this.burst(this.level.width - 140, 250, "#fff06a", 55); this.beep(880, 0.4);
    this.finishTimer = 0;
    this.finishTarget = this.activeLevel === LEVELS.length - 1 ? "won" : "map";
    this.unlockedLevel = nextUnlockedLevel(this.unlockedLevel, this.activeLevel, LEVELS.length);
    this.emit({ type: "unlockedLevelChanged", value: this.unlockedLevel });
    window.localStorage.setItem(PROGRESS_KEY, String(this.unlockedLevel));
    this.player.vx = 0; this.player.vy = -7; this.input.clear();
    this.setState("finishing");
  }

  private updateFinishing() {
    this.finishTimer++;
    this.player.vy += 0.42; this.player.y += this.player.vy;
    if (this.player.y + this.player.h >= FLOOR) {
      this.player.y = FLOOR - this.player.h;
      this.player.vy = this.finishTimer < 52 ? -5.5 : 0;
    }
    if (this.finishTimer % 9 === 0) {
      const colors = ["#fff06a", "#ff4e88", "#76f3dc", "#ffffff"];
      this.burst(
        this.level.width - 250 + Math.random() * 230,
        180 + Math.random() * 170,
        colors[Math.floor(Math.random() * colors.length)],
        9,
      );
    }
    if (this.finishTimer >= 96) this.setState(this.finishTarget);
  }

  private updateFps(timestamp: number) {
    this.fpsFrames++;
    const elapsed = timestamp - this.fpsStartedAt;
    if (elapsed >= 500) {
      this.fps = this.fpsFrames * 1000 / elapsed;
      this.fpsFrames = 0; this.fpsStartedAt = timestamp;
    }
  }

  private beep(frequency: number, duration = 0.08) {
    playTone(this.sound, frequency, duration);
  }

  private setState(value: GameState) {
    if (this.state === value) return;
    this.state = value; this.emit({ type: "stateChanged", value });
  }

  private setScore(value: number) {
    if (this.score === value) return;
    this.score = value; this.emit({ type: "scoreChanged", value });
  }

  private setCoins(value: number) {
    if (this.coins === value) return;
    this.coins = value; this.emit({ type: "coinsChanged", value });
  }

  private setLives(value: number) {
    if (this.lives === value) return;
    this.lives = value; this.emit({ type: "livesChanged", value });
  }
}
