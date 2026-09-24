import type { Player } from "../types";

export type BossPhase = "waiting" | "warning" | "charging" | "exposed" | "defeated";

export class SalamandraBoss {
  readonly name = "Salamandra Ígnea";
  readonly maxHealth = 5;
  readonly width = 104;
  readonly height = 76;
  readonly y = 458 - this.height;
  health = this.maxHealth;
  x = 3885;
  phase: BossPhase = "waiting";
  timer = 0;
  invulnerable = 0;
  facing: -1 | 1 = -1;
  active = false;

  get defeated() { return this.phase === "defeated"; }
  get vulnerable() { return this.phase === "exposed" && this.invulnerable === 0; }

  update(player: Player) {
    if (this.defeated) return;
    if (!this.active) {
      if (player.x < 3500) return;
      this.active = true;
      this.phase = "warning";
      this.timer = 62;
    }
    if (this.invulnerable > 0) this.invulnerable--;
    if (--this.timer > 0) {
      if (this.phase === "charging") this.x = Math.max(3715, Math.min(3890, this.x + this.facing * 5));
      return;
    }
    if (this.phase === "warning") {
      this.phase = "charging";
      this.facing = player.x < this.x + this.width / 2 ? -1 : 1;
      this.timer = 30;
    } else if (this.phase === "charging") {
      this.phase = "exposed";
      this.timer = 95;
    } else {
      this.phase = "warning";
      this.timer = this.health <= 2 ? 38 : 55;
    }
  }

  touches(player: Player) {
    return this.phase === "charging" && player.x < this.x + this.width - 14 &&
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
