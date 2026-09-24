import { clampEnemyToPatrol, facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateMaskedBandit: EnemyBehavior = (enemy, context) => {
  enemy.stompeable = true;
  const distance = playerDistance(enemy, context.player);
  if (enemy.state === "patrol") {
    enemy.x += enemy.vx; clampEnemyToPatrol(enemy);
    if (distance < enemy.detectionRange) { facePlayer(enemy, context.player.x); enemy.vx = 0; setEnemyState(enemy, "alert", 14); }
  } else if (enemy.state === "alert" && --enemy.stateTimer <= 0) {
    facePlayer(enemy, context.player.x);
    enemy.vx = enemy.facing * 3.1;
    setEnemyState(enemy, "attack", 40);
  } else if (enemy.state === "attack") {
    // Un dash comprometido evita que el bandido oscile al cruzarse con Niko.
    enemy.x += enemy.vx;
    enemy.stateTimer--;
    if (distance > 350 || clampEnemyToPatrol(enemy) || enemy.stateTimer <= 0) {
      enemy.vx = 0;
      setEnemyState(enemy, "recover", 32);
    }
  } else if (enemy.state === "recover" && --enemy.stateTimer <= 0) {
    enemy.facing = enemy.spawnX < enemy.x ? -1 : 1; enemy.vx = enemy.facing * 1.15; setEnemyState(enemy, "patrol");
  }
};
