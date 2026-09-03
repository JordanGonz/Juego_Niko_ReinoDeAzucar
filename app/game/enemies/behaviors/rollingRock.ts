import { clampEnemyToPatrol, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";

export const updateRollingRock: EnemyBehavior = (enemy, context) => {
  enemy.stompeable = enemy.state === "recover";
  if (enemy.state === "attack") {
    enemy.x += enemy.vx;
    if (clampEnemyToPatrol(enemy)) {
      setEnemyState(enemy, "recover", 12); context.particles.spawnEnemyAttackDust(enemy.x, enemy.platformY);
    }
  } else if (enemy.state === "recover" && --enemy.stateTimer <= 0) {
    enemy.vx = enemy.facing * 2.35; setEnemyState(enemy, "attack");
  }
};
