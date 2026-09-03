import type { RuntimeEnemy } from "../types";

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
