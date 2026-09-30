import { FLOOR, LEVELS } from "../levels.ts";
import type { Player } from "../types.ts";

export type WorldExit = {
  destination: number;
  spawn: { x: number; y: number };
  kind: "main-forward" | "main-back" | "upper-path" | "lower-path";
};

export function resolveWorldExit(levelIndex: number, player: Player, movingLeft: boolean, movingRight: boolean,
  unlockedLevel: number, bossDefeated: boolean): WorldExit | null {
  const playerHeight = player.collisionBounds.height;
  if (levelIndex === 0 && unlockedLevel >= 2 && player.x >= 3190 && player.x <= 3385 && player.y <= -20)
    return { destination: 2, spawn: { x: 3070, y: LEVELS[2].platforms[17][1] - playerHeight }, kind: "upper-path" };
  if (levelIndex === 2 && player.x >= 3105 && player.x <= 3165 && player.y >= 500)
    return { destination: 0, spawn: { x: 3260, y: 35 }, kind: "lower-path" };
  if (levelIndex > 0 && movingLeft && player.x <= 0)
    return { destination: levelIndex - 1,
      spawn: { x: LEVELS[levelIndex - 1].width - 75, y: FLOOR - playerHeight }, kind: "main-back" };
  if (levelIndex < LEVELS.length - 1 && movingRight &&
    player.x >= LEVELS[levelIndex].width - player.collisionBounds.width &&
    (levelIndex !== 1 || bossDefeated))
    return { destination: levelIndex + 1, spawn: { x: 45, y: FLOOR - playerHeight }, kind: "main-forward" };
  return null;
}
