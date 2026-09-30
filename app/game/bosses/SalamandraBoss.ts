import type { Player } from "../types";

export type BossPhase = "waiting" | "warning" | "charging" | "warningLeap" | "leaping" | "impact" | "exposed" | "defeated";

export class SalamandraBoss {
  readonly name = "Salamandra Ígnea";
  readonly maxHealth = 5;
  readonly width = 150;
  readonly height = 100;
  y = 458 - this.height;
  health = this.maxHealth;
  x = 4540;
  phase: BossPhase = "waiting";
  timer = 0;
  invulnerable = 0;
  facing: -1 | 1 = -1;
  active = false;
  age = 0;
  targetX = this.x;
  private leapStartX = this.x;
  private attackCount = 0;

  get defeated() { return this.phase === "defeated"; }
  get vulnerable() { return this.phase === "exposed" && this.invulnerable === 0; }

  update(player: Player) {
    if (this.defeated) return;
    this.age++;
    if (!this.active) {
      if (player.x < 4000) return;
      this.active = true;
      this.phase = "warning";
      this.timer = 72;
    }
    if (this.invulnerable > 0) this.invulnerable--;
    if (this.phase === "leaping") {
      const progress = 1 - --this.timer / 44;
      this.x = this.leapStartX + (this.targetX - this.leapStartX) * progress;
      this.y = 458 - this.height - Math.sin(progress * Math.PI) * 145;
      if (this.timer <= 0) { this.x = this.targetX; this.y = 458 - this.height; this.phase = "impact"; this.timer = 18; }
      return;
    }
    if (--this.timer > 0) {
      if (this.phase === "charging") this.x = Math.max(3900, Math.min(4770, this.x + this.facing * (this.health <= 2 ? 11 : 9.5)));
      return;
    }
    if (this.phase === "warning") {
      this.phase = "charging";
      this.facing = player.x < this.x + this.width / 2 ? -1 : 1;
      this.timer = 48;
    } else if (this.phase === "charging") {
      this.phase = "exposed";
      this.timer = 100;
    } else if (this.phase === "warningLeap") {
      this.leapStartX = this.x;
      this.phase = "leaping";
      this.timer = 44;
    } else if (this.phase === "impact") {
      this.phase = "exposed";
      this.timer = 100;
    } else {
      this.phase = ++this.attackCount % 2 ? "warningLeap" : "warning";
      this.targetX = Math.max(3900, Math.min(4770, player.x - this.width / 2));
      this.timer = this.health <= 2 ? 42 : 60;
    }
  }

  touches(player: Player) {
    return (this.phase === "charging" || this.phase === "impact") && player.x < this.x + this.width - 14 &&
      player.x + player.collisionBounds.width > this.x + 14 &&
      player.y + player.collisionBounds.height > this.y + 14 && player.y < this.y + this.height;
  }

  strike(player: Player) {
    if (!this.vulnerable) return false;
    const left = player.facing === 1 ? player.x + player.collisionBounds.width : player.x - 64;
    const right = left + 64;
    if (right <= this.x + 12 || left >= this.x + this.width - 12 ||
        player.y + player.collisionBounds.height < this.y + 16 || player.y > this.y + this.height) return false;
    this.health--;
    this.invulnerable = 25;
    this.timer = Math.max(this.timer, 28);
    if (this.health === 0) this.phase = "defeated";
    return true;
  }
}
