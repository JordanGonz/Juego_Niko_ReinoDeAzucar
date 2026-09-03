import { collisionRect } from "../entities/Player.ts";
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
  return body.x + body.width > enemy.x - 18 && body.x < enemy.x + 18 &&
    body.y + body.height > enemy.y && body.y < enemy.y + 34;
}
