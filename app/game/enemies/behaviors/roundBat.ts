import { facePlayer, setEnemyState } from "../../entities/Enemy.ts";
import type { EnemyBehavior } from "./context.ts";
import { playerDistance } from "./context.ts";

export const updateRoundBat: EnemyBehavior = (enemy, context) => {
  enemy.stompeable = true; enemy.phaseTimer++;
  if (enemy.state === "patrol") {
    enemy.x += enemy.vx; enemy.y = enemy.baseY + Math.sin(enemy.phaseTimer * 0.055) * 18;
    if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) { enemy.vx *= -1; enemy.facing = enemy.vx < 0 ? -1 : 1; }
    if (playerDistance(enemy, context.player) < enemy.detectionRange && context.player.y > enemy.y) {
      facePlayer(enemy, context.player.x); setEnemyState(enemy, "anticipate", 18);
    }
  } else if (enemy.state === "anticipate") {
    if (--enemy.stateTimer <= 0) { enemy.vx = enemy.facing * 1.6; enemy.vy = 3.3; setEnemyState(enemy, "attack", 45); }
  } else if (enemy.state === "attack") {
    enemy.x += enemy.vx; enemy.y += enemy.vy;
    if (--enemy.stateTimer <= 0 || enemy.y > enemy.baseY + 100) setEnemyState(enemy, "recover");
  } else if (enemy.state === "recover") {
    enemy.y += (enemy.baseY - enemy.y) * 0.09;
    enemy.x += (enemy.spawnX - enemy.x) * 0.025;
    if (Math.abs(enemy.y - enemy.baseY) < 2) { enemy.y = enemy.baseY; enemy.vy = 0; enemy.vx = enemy.facing * 0.8; setEnemyState(enemy, "patrol"); }
  }
};
