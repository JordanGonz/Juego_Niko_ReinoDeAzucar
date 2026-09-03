import { clampEnemyToPatrol, facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateBlobHopper: EnemyBehavior = (enemy, context) => {
  enemy.stompeable = true;
  if (enemy.state === "idle") {
    enemy.vx = 0;
    if (playerDistance(enemy, context.player) <= enemy.detectionRange) {
      facePlayer(enemy, context.player.x); setEnemyState(enemy, "anticipate", 24);
      context.particles.spawnEnemyAlert(enemy.x, enemy.y);
    }
  } else if (enemy.state === "anticipate") {
    if (--enemy.stateTimer <= 0) {
      enemy.vx = enemy.facing * 1.45; enemy.vy = -8.8; setEnemyState(enemy, "airborne");
    }
  } else if (enemy.state === "airborne") {
    enemy.vy = Math.min(10, enemy.vy + 0.55); enemy.x += enemy.vx; enemy.y += enemy.vy;
    clampEnemyToPatrol(enemy);
    if (enemy.y + enemy.collisionBounds.height >= enemy.platformY) {
      enemy.y = enemy.platformY - enemy.collisionBounds.height; enemy.vy = 0; enemy.vx = 0;
      setEnemyState(enemy, "land", 10); context.particles.spawnEnemyLand(enemy.x, enemy.platformY);
    }
  } else if (enemy.state === "land") {
    if (--enemy.stateTimer <= 0) setEnemyState(enemy, "recover", 28);
  } else if (enemy.state === "recover" && --enemy.stateTimer <= 0) {
    setEnemyState(enemy, "idle");
  }
};
