import { collisionRect } from "../entities/Player.ts";
import { enemyCollisionRect } from "../entities/Enemy.ts";
import type { Level, Player, RuntimeEnemy } from "../types";

export function landPlayer(player: Player, level: Level, oldBottom: number) {
  const body = collisionRect(player);
  for (const [x, y, width] of level.platforms) {
    const overlap = Math.min(body.x + body.width, x + width - 3) - Math.max(body.x, x + 3);
    const requiredSupport = Math.min(9, body.width * 0.28);
    if (overlap >= requiredSupport && oldBottom <= y + 4 && body.y + body.height >= y && player.vy >= 0) {
      player.y = y - player.collisionBounds.offsetY - player.collisionBounds.height;
      player.vy = 0;
      player.grounded = true;
      return { x, y, width, footCenter: body.x + body.width / 2 };
    }
  }
  return null;
}

export function overlapsEnemy(player: Player, enemy: RuntimeEnemy) {
  const body = collisionRect(player);
  const target = enemyCollisionRect(enemy);
  return enemy.alive && enemy.contactEnabled && body.x + body.width > target.x && body.x < target.x + target.width &&
    body.y + body.height > target.y && body.y < target.y + target.height;
}
