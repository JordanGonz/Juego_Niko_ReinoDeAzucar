import type { Particle, Player } from "../types";

export class ParticleSystem {
  particles: Particle[] = [];

  clear() { this.particles = []; }

  update() {
    this.particles.forEach((particle) => {
      particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.18; particle.life--;
    });
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  burst(x: number, y: number, color: string, count = 10, speed = 6) {
    for (let index = 0; index < count; index++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * speed,
        vy: -Math.random() * 5,
        life: 30 + Math.random() * 25,
        color,
      });
    }
  }

  spawnJumpDust(player: Player) { this.dust(player.x + 15, player.y + player.collisionBounds.height, 5); }
  spawnLandDust(player: Player, strong = false) { this.dust(player.x + 15, player.y + player.collisionBounds.height, strong ? 11 : 7); }
  spawnRunDust(player: Player) { this.dust(player.x + (player.facing > 0 ? 4 : 26), player.y + player.collisionBounds.height, 2); }
  spawnSkidDust(player: Player) { this.dust(player.x + 15, player.y + player.collisionBounds.height, 6); }
  spawnPlayerHit(player: Player) { this.burst(player.x + 15, player.y + 22, "#ff557c", 14); }
  spawnEnemyStomp(x: number, y: number) { this.burst(x, y, "#f16aff", 16); }
  spawnEnemyDefeat(x: number, y: number) { this.burst(x, y, "#ffe047", 18, 7); }
  spawnEnemyLand(x: number, y: number) { this.dust(x + 17, y, 7); }
  spawnEnemyAttackDust(x: number, y: number) { this.dust(x + 19, y, 9); }
  spawnEnemyAlert(x: number, y: number) { this.burst(x + 17, y - 8, "#fff06a", 5, 2.5); }
  spawnProjectileImpact(x: number, y: number) { this.burst(x, y, "#75f7e7", 9, 4); }

  private dust(x: number, y: number, count: number) {
    for (let index = 0; index < count; index++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 3,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -0.4 - Math.random() * 1.6,
        life: 14 + Math.random() * 10,
        color: "#f4ddc5",
        size: 3 + Math.random() * 4,
      });
    }
  }
}
