import type { Level, RuntimeEnemy } from "../types";

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

export function moveEnemy(enemy: RuntimeEnemy) {
  enemy.x += enemy.vx;
  if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
    enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
    enemy.vx *= -1;
  }
}

export function clampPlayerX(x: number, playerWidth: number, levelWidth: number) {
  return Math.max(0, Math.min(levelWidth - playerWidth, x));
}
