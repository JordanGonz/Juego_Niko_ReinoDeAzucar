import { collisionRect } from "../entities/Player.ts";
import { projectileCollisionRect } from "../entities/Projectile.ts";
import type { Player, RuntimeEnemy, RuntimeProjectile } from "../types";

function overlaps(a: { x:number; y:number; width:number; height:number }, b: { x:number; y:number; width:number; height:number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function projectileHitsPlayer(projectile: RuntimeProjectile, player: Player) {
  return projectile.alive && overlaps(projectileCollisionRect(projectile), collisionRect(player));
}

export function damagePlayerFromProjectile(player: Player, projectile: RuntimeProjectile) {
  player.inv = 100; player.vy = -8; player.vx = projectile.vx > 0 ? -7 : 7;
  return projectile.damage;
}

export class ProjectileSystem {
  projectiles: RuntimeProjectile[] = [];
  private nextId = 0;

  clear() { this.projectiles = []; }

  fireCannonBall(enemy: RuntimeEnemy) {
    const size = 14;
    const x = enemy.facing > 0 ? enemy.x + enemy.collisionBounds.width + 3 : enemy.x - size - 3;
    const projectile: RuntimeProjectile = {
      id: `cannon-ball-${this.nextId++}`, type:"cannonBall", x, y:enemy.y + 10,
      vx:enemy.facing * 5.2, vy:0, damage:1, lifetime:180, alive:true,
      collisionBounds:{ offsetX:0, offsetY:0, width:size, height:size },
      visualBounds:{ offsetX:-2, offsetY:-2, width:18, height:18 },
    };
    this.projectiles.push(projectile);
    return projectile;
  }

  update(levelWidth: number) {
    this.projectiles.forEach((projectile) => {
      projectile.x += projectile.vx; projectile.y += projectile.vy; projectile.lifetime--;
      if (projectile.lifetime <= 0 || projectile.x < -40 || projectile.x > levelWidth + 40) projectile.alive = false;
    });
    this.projectiles = this.projectiles.filter((projectile) => projectile.alive);
  }

  consumePlayerHit(player: Player) {
    const hit = this.projectiles.find((projectile) => projectileHitsPlayer(projectile, player));
    if (hit) hit.alive = false;
    return hit ?? null;
  }
}
