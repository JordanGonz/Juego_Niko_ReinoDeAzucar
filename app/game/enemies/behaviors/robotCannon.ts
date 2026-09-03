import { facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateRobotCannon: EnemyBehavior = (enemy, context) => {
  enemy.vx = 0; enemy.stompeable = true;
  if (enemy.state === "idle" && playerDistance(enemy, context.player) < enemy.detectionRange) {
    facePlayer(enemy, context.player.x); setEnemyState(enemy, "anticipate", 34);
  } else if (enemy.state === "anticipate" && --enemy.stateTimer <= 0) {
    context.fireProjectile(enemy); setEnemyState(enemy, "cooldown", 92);
  } else if (enemy.state === "cooldown" && --enemy.stateTimer <= 0) {
    setEnemyState(enemy, "idle");
  }
};
