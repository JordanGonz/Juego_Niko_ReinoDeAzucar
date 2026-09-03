import { clampEnemyToPatrol, facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateSpikeBeetle: EnemyBehavior = (enemy, context) => {
  enemy.stompeable = enemy.state !== "attack" && enemy.state !== "anticipate";
  if (enemy.state === "patrol") {
    enemy.x += enemy.vx; clampEnemyToPatrol(enemy);
    if (playerDistance(enemy, context.player) < enemy.detectionRange) {
      facePlayer(enemy, context.player.x); enemy.vx = 0; setEnemyState(enemy, "anticipate", 22);
      context.particles.spawnEnemyAlert(enemy.x, enemy.y);
    }
  } else if (enemy.state === "anticipate") {
    if (--enemy.stateTimer <= 0) { enemy.vx = enemy.facing * 4.2; setEnemyState(enemy, "attack", 105); }
  } else if (enemy.state === "attack") {
    enemy.x += enemy.vx;
    if (clampEnemyToPatrol(enemy) || --enemy.stateTimer <= 0) { enemy.vx = 0; setEnemyState(enemy, "recover", 26); }
  } else if (enemy.state === "recover" && --enemy.stateTimer <= 0) {
    enemy.vx = enemy.facing * 1; setEnemyState(enemy, "patrol");
  }
};
