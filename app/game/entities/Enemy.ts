import type { EnemyState, Rect, RuntimeEnemy } from "../types";

export function enemyCollisionRect(enemy: RuntimeEnemy): Rect {
  const bounds = enemy.collisionBounds;
  return { x:enemy.x + bounds.offsetX, y:enemy.y + bounds.offsetY, width:bounds.width, height:bounds.height };
}

export function enemyVisualRect(enemy: RuntimeEnemy): Rect {
  const bounds = enemy.visualBounds;
  return { x:enemy.x + bounds.offsetX, y:enemy.y + bounds.offsetY, width:bounds.width, height:bounds.height };
}

export function setEnemyState(enemy: RuntimeEnemy, state: EnemyState, timer = 0) {
  if (enemy.state !== state) { enemy.animationFrame = 0; enemy.animationTimer = 0; }
  enemy.state = state;
  enemy.animationState = state;
  enemy.stateTimer = timer;
}

export function facePlayer(enemy: RuntimeEnemy, playerX: number) {
  enemy.facing = playerX < enemy.x ? -1 : 1;
}

export function clampEnemyToPatrol(enemy: RuntimeEnemy) {
  if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
    enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
    enemy.vx *= -1;
    enemy.facing = enemy.vx < 0 ? -1 : 1;
    return true;
  }
  return false;
}
