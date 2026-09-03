import { facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateStealthGhost: EnemyBehavior = (enemy, context) => {
  enemy.phaseTimer = (enemy.phaseTimer + 1) % 180;
  if (enemy.phaseTimer < 70) {
    setEnemyState(enemy, "phase"); enemy.opacity = 0.24; enemy.contactEnabled = false; enemy.vx = 0;
  } else if (enemy.phaseTimer < 140) {
    enemy.opacity = 0.88; enemy.contactEnabled = true;
    if (enemy.state === "phase") setEnemyState(enemy, "alert", 16);
    facePlayer(enemy, context.player.x);
    if (enemy.state === "alert" && enemy.stateTimer > 0) enemy.stateTimer--;
    else {
      setEnemyState(enemy, "attack");
      if (playerDistance(enemy, context.player) < enemy.detectionRange) {
        enemy.x += enemy.facing * 0.72;
        enemy.y += Math.sign(context.player.y - enemy.y) * 0.28;
      }
    }
  } else {
    setEnemyState(enemy, "recover"); enemy.opacity = 0.55; enemy.contactEnabled = false;
    enemy.x += (enemy.spawnX - enemy.x) * 0.025; enemy.y += (enemy.baseY - enemy.y) * 0.025;
  }
};
