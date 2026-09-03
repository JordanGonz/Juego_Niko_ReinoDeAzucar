import type { Level, Player, RuntimeEnemy } from "./types";

export function createEnemies(level: Level): RuntimeEnemy[] {
  return level.enemies.map(([x, platformIndex], index) => {
    const [platformX, platformY, platformWidth] = level.platforms[platformIndex];
    return {
      x,
      y: platformY - 34,
      vx: index % 2 ? -1.15 : 1.15,
      minX: platformX + 24,
      maxX: platformX + platformWidth - 24,
      alive: true,
    };
  });
}

export function landPlayer(player: Player, level: Level, oldBottom: number) {
  for (const [x, y, width] of level.platforms) {
    const footCenter = player.x + player.w / 2;
    const feetOverPlatform = footCenter >= x + 3 && footCenter <= x + width - 3;
    if (feetOverPlatform && oldBottom <= y + 4 && player.y + player.h >= y && player.vy >= 0) {
      player.y = y - player.h;
      player.vy = 0;
      player.grounded = true;
      return { x, y, width, footCenter };
    }
  }
  return null;
}

export function moveEnemy(enemy: RuntimeEnemy) {
  enemy.x += enemy.vx;
  if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
    enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
    enemy.vx *= -1;
  }
}

export function overlapsEnemy(player: Player, enemy: RuntimeEnemy) {
  return player.x + player.w > enemy.x - 18 && player.x < enemy.x + 18 &&
    player.y + player.h > enemy.y && player.y < enemy.y + 34;
}
