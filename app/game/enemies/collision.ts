import { collisionRect } from "../entities/Player.ts";
import { enemyCollisionRect, setEnemyState } from "../entities/Enemy.ts";
import type { ParticleSystem } from "../systems/ParticleSystem";
import type { Player, RuntimeEnemy } from "../types";

function overlaps(a: { x:number; y:number; width:number; height:number }, b: { x:number; y:number; width:number; height:number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function classifyEnemyContact(player: Player, enemy: RuntimeEnemy): "stomp" | "side" | null {
  if (!enemy.alive || !enemy.contactEnabled) return null;
  const playerRect = collisionRect(player);
  const enemyRect = enemyCollisionRect(enemy);
  if (!overlaps(playerRect, enemyRect)) return null;
  const playerBottom = playerRect.y + playerRect.height;
  const descendingFromAbove = player.vy > 2 && playerBottom <= enemyRect.y + Math.min(18, enemyRect.height * 0.55);
  return descendingFromAbove && enemy.stompeable ? "stomp" : "side";
}

export function damagePlayerFromEnemy(player: Player, enemy: RuntimeEnemy) {
  player.inv = 100; player.vy = -8;
  player.vx = player.x < enemy.x ? -7 : 7;
  return enemy.damage;
}

export function defeatEnemy(enemy: RuntimeEnemy, particles?: ParticleSystem) {
  enemy.health--;
  if (enemy.health > 0) { setEnemyState(enemy, "hurt", 12); return false; }
  enemy.alive = false; enemy.defeated = true; enemy.contactEnabled = false;
  enemy.vx = 0; enemy.vy = 0; setEnemyState(enemy, "defeated");
  particles?.spawnEnemyDefeat(enemy.x + enemy.collisionBounds.width / 2, enemy.y + enemy.collisionBounds.height / 2);
  return true;
}
