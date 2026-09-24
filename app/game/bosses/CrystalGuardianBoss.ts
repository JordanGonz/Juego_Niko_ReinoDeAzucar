import { FLOOR } from "../levels.ts";
import type { Player } from "../types";

export type CrystalPhase =
  | "waiting" | "awakening" | "warningDash" | "dash"
  | "warningSlam" | "leap" | "impact"
  | "warningBolts" | "barrage" | "warningWaves" | "waves"
  | "exposed" | "stagger" | "defeated";

export type CrystalBolt = { x: number; y: number; vx: number; vy: number; radius: number; life: number };
export type CrystalWave = { x: number; vx: number; width: number; life: number };

const ARENA_LEFT = 4450;
const ARENA_RIGHT = 5220;

export class CrystalGuardianBoss {
  readonly name = "Guardián Celeste";
  readonly maxHealth = 9;
  readonly width = 190;
  readonly height = 160;
  readonly bolts: CrystalBolt[] = [];
  readonly waves: CrystalWave[] = [];
  health = this.maxHealth;
  x = 5050;
  y = FLOOR - this.height;
  phase: CrystalPhase = "waiting";
  timer = 0;
  invulnerable = 0;
  facing: -1 | 1 = -1;
  active = false;
  age = 0;
  targetX = 4900;
  private leapStartX = this.x;
  private attackIndex = 0;

  get defeated() { return this.phase === "defeated"; }
  get vulnerable() { return this.phase === "exposed" && this.invulnerable === 0; }
  get enraged() { return this.health <= 3; }

  update(player: Player) {
    if (this.defeated) return;
    this.age++;
    if (!this.active) {
      if (player.x < 4400) return;
      this.active = true;
      this.phase = "awakening";
      this.timer = 82;
    }
    if (this.invulnerable > 0) this.invulnerable--;
    this.updateHazards();

    if (this.phase === "dash") {
      this.x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, this.x + this.facing * (this.enraged ? 10 : 7.5)));
      if (--this.timer <= 0 || this.x === ARENA_LEFT || this.x === ARENA_RIGHT) this.expose();
      return;
    }
    if (this.phase === "leap") {
      const progress = 1 - --this.timer / (this.enraged ? 38 : 46);
      this.x = this.leapStartX + (this.targetX - this.leapStartX) * progress;
      this.y = FLOOR - this.height - Math.sin(progress * Math.PI) * 155;
      if (this.timer <= 0) { this.x = this.targetX; this.y = FLOOR - this.height; this.phase = "impact"; this.timer = 19; }
      return;
    }
    if (this.phase === "barrage" && this.timer % (this.enraged ? 17 : 23) === 0) this.fireBolts(player);
    if (this.phase === "waves" && this.timer % (this.enraged ? 20 : 28) === 0) this.fireWaves();
    if (--this.timer > 0) return;

    switch (this.phase) {
      case "waiting": case "awakening": case "stagger": case "exposed": this.nextAttack(player); break;
      case "warningDash":
        this.phase = "dash"; this.timer = this.enraged ? 57 : 70; break;
      case "warningSlam":
        this.leapStartX = this.x;
        this.phase = "leap"; this.timer = this.enraged ? 38 : 46; break;
      case "warningBolts": this.phase = "barrage"; this.timer = this.enraged ? 110 : 96; break;
      case "warningWaves": this.phase = "waves"; this.timer = this.enraged ? 105 : 92; break;
      default: this.expose();
    }
  }

  touches(player: Player) {
    if (this.phase !== "dash" && this.phase !== "impact") return false;
    const padding = this.phase === "dash" ? 18 : -20;
    return player.x < this.x + this.width - padding &&
      player.x + player.collisionBounds.width > this.x + padding &&
      player.y + player.collisionBounds.height > this.y + 22 && player.y < FLOOR;
  }

  consumeHazardHit(player: Player) {
    const cx = player.x + player.collisionBounds.width / 2;
    const cy = player.y + player.collisionBounds.height / 2;
    const bolt = this.bolts.findIndex((shot) => Math.hypot(cx - shot.x, cy - shot.y) < shot.radius + 19);
    if (bolt >= 0) { this.bolts.splice(bolt, 1); return true; }
    const wave = this.waves.findIndex((item) => player.y + player.collisionBounds.height > FLOOR - 36 &&
      player.x < item.x + item.width && player.x + player.collisionBounds.width > item.x);
    if (wave >= 0) { this.waves.splice(wave, 1); return true; }
    return false;
  }

  strike(player: Player) {
    if (!this.vulnerable) return false;
    const left = player.facing === 1 ? player.x + player.collisionBounds.width : player.x - 64;
    const right = left + 64;
    if (right <= this.x + 12 || left >= this.x + this.width - 12 ||
      player.y + player.collisionBounds.height < this.y + 18 || player.y > FLOOR) return false;
    this.health--;
    this.invulnerable = 34;
    this.bolts.length = 0;
    this.waves.length = 0;
    if (this.health === 0) this.phase = "defeated";
    else { this.phase = "stagger"; this.timer = 36; }
    return true;
  }

  private nextAttack(player: Player) {
    this.facing = player.x < this.x + this.width / 2 ? -1 : 1;
    this.targetX = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, player.x - this.width / 2));
    const order = ["warningDash", "warningSlam", "warningBolts", "warningWaves"] as const;
    this.phase = order[this.attackIndex++ % order.length];
    this.timer = this.enraged ? 31 : 48;
  }

  private expose() {
    this.phase = "exposed";
    this.timer = this.enraged ? 66 : 92;
    this.y = FLOOR - this.height;
    this.bolts.length = 0;
    this.waves.length = 0;
  }

  private fireBolts(player: Player) {
    const originX = this.x + this.width / 2;
    const originY = this.y + 64;
    const dx = player.x + player.collisionBounds.width / 2 - originX;
    const dy = player.y + player.collisionBounds.height / 2 - originY;
    const angle = Math.atan2(dy, dx);
    for (const offset of [-0.24, 0, 0.24]) {
      const speed = this.enraged ? 7 : 5.7;
      this.bolts.push({ x: originX, y: originY,
        vx: Math.cos(angle + offset) * speed, vy: Math.sin(angle + offset) * speed,
        radius: 11, life: 135 });
    }
  }

  private fireWaves() {
    const center = this.x + this.width / 2;
    const speed = this.enraged ? 8 : 6.3;
    this.waves.push({ x: center - 30, vx: -speed, width: 42, life: 135 });
    this.waves.push({ x: center + 30, vx: speed, width: 42, life: 135 });
  }

  private updateHazards() {
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const shot = this.bolts[i]; shot.x += shot.vx; shot.y += shot.vy;
      if (--shot.life <= 0 || shot.x < ARENA_LEFT - 80 || shot.x > ARENA_RIGHT + 240 || shot.y > FLOOR + 40) this.bolts.splice(i, 1);
    }
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i]; wave.x += wave.vx;
      if (--wave.life <= 0 || wave.x < ARENA_LEFT - 80 || wave.x > ARENA_RIGHT + 240) this.waves.splice(i, 1);
    }
  }
}
