import { enemyCollisionRect, enemyVisualRect } from "../entities/Enemy.ts";
import type { RuntimeEnemy } from "../types";

export function getEnemyDebugData(enemy: RuntimeEnemy) {
  return {
    id:enemy.id, type:enemy.type, state:enemy.state, health:enemy.health, facing:enemy.facing,
    timer:enemy.stateTimer, detectionRange:enemy.detectionRange,
    patrol:[enemy.minX, enemy.maxX] as const,
    collision:enemyCollisionRect(enemy), visual:enemyVisualRect(enemy),
  };
}
