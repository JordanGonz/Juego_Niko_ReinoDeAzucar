import { AnimationController } from "../animation/AnimationController";
import { PLAYER_ANIMATION_CLIPS, resolvePlayerState } from "../animation/playerAnimations";
import { playTone } from "../audio";
import { Camera } from "../camera/Camera";
import { collisionRect, createPlayer, resetPlayer } from "../entities/Player";
import { FLOOR, LEVELS, MAX_LIVES, PROGRESS_KEY } from "../levels";
import { landPlayer, overlapsEnemy } from "../physics/collision";
import { clampPlayerX, createEnemies, moveEnemy } from "../physics/movement";
import { applyGravity, applyJumpCut, bufferJump, consumeBufferedJump, moveTowards, refreshCoyoteTime, updatePlayerTimers } from "../physics/playerMovement";
import { movementForLevel } from "../physics/tuning";
import { GameRenderer } from "../rendering/GameRenderer";
import { ParticleSystem } from "../systems/ParticleSystem";
import type { GameEvent, GamePower, GameState, Player, PlayerState, RuntimeCoin, RuntimeEnemy, RuntimePickup } from "../types";
import { FIXED_UPDATE_RATE, GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { createInitialSession, nextUnlockedLevel } from "./session";

type GameCommand = { type: "newGame" } | { type: "loadLevel"; index: number };
const JUMP_KEYS = ["ArrowUp", "KeyW", "Space"] as const;

export class Game {
  private readonly renderer: GameRenderer;
  private readonly input: InputManager;
  private readonly loop: GameLoop;
  private readonly camera = new Camera();
  private readonly player: Player = createPlayer();
  private readonly particles = new ParticleSystem();
  private readonly animation = new AnimationController<PlayerState>(PLAYER_ANIMATION_CLIPS, "idle");
  private state: GameState = "ready";
  private activeLevel = 0;
  private level = LEVELS[0];
  private score = 0;
  private coins = 0;
  private lives = 3;
  private unlockedLevel = 0;
  private activePower: GamePower = "";
  private powerTimer = 0;
  private lastSafe = { x: 100, y: FLOOR - this.player.collisionBounds.height };
  private tick = 0;
  private finishTimer = 0;
  private finishTarget: "map" | "won" = "map";
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
    this.loop = new GameLoop(
      (stepSeconds) => this.update(stepSeconds),
      (timestamp) => this.render(timestamp),
    );
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

  setTouch(code: string, pressed: boolean) { this.input.setTouch(code, pressed); }
  setSound(enabled: boolean) { this.sound = enabled; }
  private resize = () => this.renderer.resize();

  private primaryAction() {
    if (this.state !== "playing" && this.state !== "map") this.newGame();
  }

  private loadLevel(index: number) {
    this.activeLevel = index;
    this.level = LEVELS[index];
    resetPlayer(this.player);
    this.camera.reset();
    this.finishTimer = 0;
    this.lastSafe = { x: 100, y: FLOOR - this.player.collisionBounds.height };
    this.setCoins(0);
    this.activePower = ""; this.powerTimer = 0; this.emit({ type: "powerChanged", value: "" });
    this.coinList = this.level.coins.map(([x, y]) => ({ x, y, taken: false }));
    this.pickupList = this.level.pickups.map(([x, y, type]) => ({ x, y, type, taken: false }));
    this.enemies = createEnemies(this.level);
    this.particles.clear();
    this.animation.setState("idle");
    this.emit({ type: "levelChanged", value: index, coinGoal: this.level.coins.length });
  }

  private resetGame() {
    const session = createInitialSession();
    this.setScore(session.score); this.setLives(session.lives);
    this.loadLevel(session.levelIndex);
  }

  private update(stepSeconds: number) {
    this.tick++;
    if (this.command?.type === "newGame") { this.resetGame(); this.command = null; }
    if (this.command?.type === "loadLevel") {
      const requestedLevel = this.command.index;
      this.command = null;
      this.loadLevel(requestedLevel);
    }

    if (this.state === "playing") this.updatePlaying(stepSeconds);
    else {
      updatePlayerTimers(this.player, stepSeconds);
      if (this.state === "finishing") this.updateFinishing();
    }

    const nextState = resolvePlayerState(this.player, this.state);
    this.player.state = nextState;
    this.animation.setState(nextState);
    this.player.animationState = this.animation.state;
    this.animation.update(stepSeconds);
    this.particles.update();
    this.input.endStep();
  }

  private updatePlaying(stepSeconds: number) {
    const config = movementForLevel(this.level);
    updatePlayerTimers(this.player, stepSeconds);
    refreshCoyoteTime(this.player, config.coyoteTime);
    if (this.input.wasPressed(...JUMP_KEYS)) bufferJump(this.player, config.jumpBufferTime);
    if (this.input.wasReleased(...JUMP_KEYS)) this.player.vy = applyJumpCut(this.player.vy, config.jumpCutMultiplier);

    const left = this.input.isDown("ArrowLeft", "KeyA");
    const right = this.input.isDown("ArrowRight", "KeyD");
    const direction = left ? -1 : right ? 1 : 0;
    const maxSpeed = this.activePower === "TURBO" ? config.boostMaxRunSpeed : config.maxRunSpeed;
    const changingDirection = direction !== 0 && Math.sign(this.player.vx) !== direction && Math.abs(this.player.vx) >= config.skidThreshold;
    if (changingDirection) {
      if (this.player.skidTimer <= 0) this.particles.spawnSkidDust(this.player);
      this.player.skidTimer = config.skidDuration;
    }
    if (direction !== 0) {
      const acceleration = this.player.grounded ? config.groundAcceleration : config.airAcceleration;
      this.player.vx = moveTowards(this.player.vx, direction * maxSpeed, acceleration);
      this.player.facing = direction;
    } else {
      const deceleration = this.player.grounded ? config.groundDeceleration : config.airDeceleration;
      this.player.vx = moveTowards(this.player.vx, 0, deceleration);
    }

    const jumpVelocity = config.jumpVelocity + (this.activePower === "TURBO" ? config.boostJumpBonus : 0);
    if (consumeBufferedJump(this.player, jumpVelocity, config.jumpStartDuration)) {
      this.particles.spawnJumpDust(this.player);
      this.beep(310, 0.08);
    }

    this.player.vy = applyGravity(this.player.vy, config);
    const bodyBeforeMove = collisionRect(this.player);
    const oldBottom = bodyBeforeMove.y + bodyBeforeMove.height;
    const impactVelocity = this.player.vy;
    const wasGrounded = this.player.grounded;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    this.player.x = clampPlayerX(this.player.x, this.player.collisionBounds.width, this.level.width);
    this.player.grounded = false;
    const landing = landPlayer(this.player, this.level, oldBottom);
    if (landing && !wasGrounded && impactVelocity >= config.landingThreshold) {
      const hardLanding = impactVelocity >= config.hardLandingThreshold;
      this.player.landingTimer = config.landingDuration;
      this.particles.spawnLandDust(this.player, hardLanding);
      if (hardLanding) this.camera.impulse(1.4, 4);
    }
    if (landing && landing.y === FLOOR && landing.footCenter > landing.x + 42 && landing.footCenter < landing.x + landing.width - 42) {
      this.lastSafe = {
        x: Math.max(landing.x + 24, Math.min(landing.x + landing.width - this.player.collisionBounds.width - 24, this.player.x)),
        y: landing.y - this.player.collisionBounds.height,
      };
    }

    if (this.player.grounded && Math.abs(this.player.vx) >= 4 && this.player.runDustTimer <= 0) {
      this.particles.spawnRunDust(this.player);
      this.player.runDustTimer = config.runDustInterval;
    }

    this.collectCoins();
    this.collectPickups();
    this.updateEnemies(config.hurtDuration);

    if (this.player.inv > 0) this.player.inv--;
    if (this.powerTimer > 0) {
      this.powerTimer--;
      if (this.powerTimer === 0) { this.activePower = ""; this.emit({ type: "powerChanged", value: "" }); }
    }
    if (this.player.y > 580) this.loseLife();
    if (this.player.x > this.level.width - 205) this.finishLevel();
    this.camera.follow(this.player.x, this.player.vx, this.level.width, this.renderer.viewportWidth);
  }

  private collectCoins() {
    const body = collisionRect(this.player);
    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;
    this.coinList.forEach((coin) => {
      if (!coin.taken && Math.hypot(centerX - coin.x, centerY - coin.y) < 32) {
        coin.taken = true; this.setCoins(this.coins + 1); this.setScore(this.score + 100);
        this.particles.burst(coin.x, coin.y, "#ffe75b", 8); this.beep(720, 0.07);
      }
    });
  }

  private collectPickups() {
    const body = collisionRect(this.player);
    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;
    this.pickupList.forEach((pickup) => {
      if (pickup.taken || Math.hypot(centerX - pickup.x, centerY - pickup.y) >= 38) return;
      pickup.taken = true;
      if (pickup.type === "heart") {
        if (this.lives < MAX_LIVES) this.setLives(this.lives + 1);
        else this.setScore(this.score + 300);
        this.particles.burst(pickup.x, pickup.y, "#ff557c", 18); this.beep(940, 0.14);
      } else {
        this.activePower = pickup.type === "shield" ? "ESCUDO" : "TURBO";
        this.powerTimer = pickup.type === "shield" ? 720 : 600;
        this.emit({ type: "powerChanged", value: this.activePower });
        this.particles.burst(pickup.x, pickup.y, pickup.type === "shield" ? "#75f7e7" : "#ffe047", 20);
        this.beep(820, 0.18);
      }
    });
  }

  private updateEnemies(hurtDuration: number) {
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      moveEnemy(enemy);
      const body = collisionRect(this.player);
      const hit = overlapsEnemy(this.player, enemy);
      if (hit && this.player.vy > 2 && body.y + body.height < enemy.y + 18) {
        enemy.alive = false; this.player.vy = -9; this.setScore(this.score + 250);
        this.particles.spawnEnemyStomp(enemy.x, enemy.y); this.camera.impulse(1.2, 3); this.beep(170, 0.1);
      } else if (hit && this.player.inv <= 0) {
        this.player.inv = 100; this.player.hurtTimer = hurtDuration;
        this.player.vy = -8; this.player.vx = -this.player.facing * 7;
        if (this.activePower === "ESCUDO") {
          this.activePower = ""; this.powerTimer = 0; this.emit({ type: "powerChanged", value: "" });
          this.particles.burst(this.player.x, this.player.y, "#75f7e7", 22); this.beep(240, 0.18);
        } else {
          this.setLives(this.lives - 1); this.particles.spawnPlayerHit(this.player); this.camera.impulse(2, 5); this.beep(110, 0.18);
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
    this.player.hurtTimer = movementForLevel(this.level).hurtDuration;
    this.camera.respawn(this.player.x, this.level.width, this.renderer.viewportWidth);
  }

  private finishLevel() {
    this.setScore(this.score + this.lives * 500);
    this.particles.burst(this.level.width - 140, 250, "#fff06a", 55); this.beep(880, 0.4);
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
    if (this.player.y + this.player.collisionBounds.height >= FLOOR) {
      this.player.y = FLOOR - this.player.collisionBounds.height;
      this.player.vy = this.finishTimer < 52 ? -5.5 : 0;
    }
    if (this.finishTimer % 9 === 0) {
      const colors = ["#fff06a", "#ff4e88", "#76f3dc", "#ffffff"];
      this.particles.burst(
        this.level.width - 250 + Math.random() * 230,
        180 + Math.random() * 170,
        colors[Math.floor(Math.random() * colors.length)],
        9,
      );
    }
    if (this.finishTimer >= 96) this.setState(this.finishTarget);
  }

  private render(timestamp: number) {
    this.updateFps(timestamp);
    this.renderer.render({
      level: this.level,
      activeLevel: this.activeLevel,
      state: this.state,
      player: this.player,
      enemies: this.enemies,
      coins: this.coinList,
      pickups: this.pickupList,
      particles: this.particles.particles,
      activePower: this.activePower,
      cameraX: this.camera.renderX,
      tick: this.tick,
      finishTimer: this.finishTimer,
      debug: this.debug,
      fps: this.fps,
      fixedUpdateRate: FIXED_UPDATE_RATE,
      animationFrame: this.animation.frame,
    });
  }

  private updateFps(timestamp: number) {
    this.fpsFrames++;
    const elapsed = timestamp - this.fpsStartedAt;
    if (elapsed >= 500) {
      this.fps = this.fpsFrames * 1000 / elapsed;
      this.fpsFrames = 0; this.fpsStartedAt = timestamp;
    }
  }

  private beep(frequency: number, duration = 0.08) { playTone(this.sound, frequency, duration); }
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
