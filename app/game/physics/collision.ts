import type { Level, Player, RuntimeEnemy } from "../types";

export function landPlayer(player: Player, level: Level, oldBottom: number) {
  for (const [x, y, width] of level.platforms) {
    const footCenter = player.x + player.w / 2;
    const feetOverPlatform = footCenter >= x + 3 && footCenter <= x + width - 3;
    if (feetOverPlatform && oldBottom <= y + 4 && player.y + player.h >= y && player.vy >= 0) {
      player.y = y - player.h;
      player.vy = 0;
      player.grounded = true;
      return { x, y, width, footCenter };
    }
  }
  return null;
}

export function overlapsEnemy(player: Player, enemy: RuntimeEnemy) {
  return player.x + player.w > enemy.x - 18 && player.x < enemy.x + 18 &&
    player.y + player.h > enemy.y && player.y < enemy.y + 34;
}
