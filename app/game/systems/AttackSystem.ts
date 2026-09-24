import type { Player, RuntimeEnemy } from "../types.ts";
export const ATTACK_COOLDOWN=24;
export const ATTACK_DURATION=10;
export function attackHits(player:Player,enemy:RuntimeEnemy){
  const x=player.facing===1?player.x+player.collisionBounds.width:player.x-64;
  return enemy.alive&&enemy.contactEnabled&&enemy.x<x+64&&enemy.x+enemy.collisionBounds.width>x&&enemy.y<player.y+48&&enemy.y+enemy.collisionBounds.height>player.y-8;
}
