import { facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateBitePlant: EnemyBehavior = (enemy, context) => {
  enemy.vx = 0; enemy.vy = 0;
  enemy.stompeable = enemy.state !== "attack" && enemy.state !== "anticipate";
  if (enemy.state === "idle" && playerDistance(enemy, context.player) < enemy.detectionRange) {
    facePlayer(enemy, context.player.x); setEnemyState(enemy, "anticipate", 28);
  } else if (enemy.state === "anticipate" && --enemy.stateTimer <= 0) {
    setEnemyState(enemy, "attack", 20);
  } else if (enemy.state === "attack" && --enemy.stateTimer <= 0) {
    setEnemyState(enemy, "cooldown", 72);
  } else if (enemy.state === "cooldown" && --enemy.stateTimer <= 0) {
    setEnemyState(enemy, "idle");
  }
};
