import { FLOOR } from "../levels.ts";
import type { Player, Rect } from "../types";

export const PLAYER_COLLISION_BOUNDS = { offsetX: 0, offsetY: 0, width: 30, height: 46 } as const;
export const PLAYER_VISUAL_BOUNDS = { offsetX: -7, offsetY: -7, width: 44, height: 56 } as const;

export function createPlayer(): Player {
  return {
    x: 100,
    y: FLOOR - PLAYER_COLLISION_BOUNDS.height,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 1,
    inv: 0,
    collisionBounds: { ...PLAYER_COLLISION_BOUNDS },
    visualBounds: { ...PLAYER_VISUAL_BOUNDS },
    state: "idle",
    animationState: "idle",
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpStartTimer: 0,
    landingTimer: 0,
    skidTimer: 0,
    hurtTimer: 0,
    runDustTimer: 0,
  };
}

export function resetPlayer(player: Player) {
  const fresh = createPlayer();
  Object.assign(player, fresh);
}

export function collisionRect(player: Player): Rect {
  const bounds = player.collisionBounds;
  return { x: player.x + bounds.offsetX, y: player.y + bounds.offsetY, width: bounds.width, height: bounds.height };
}

export function visualRect(player: Player): Rect {
  const bounds = player.visualBounds;
  return { x: player.x + bounds.offsetX, y: player.y + bounds.offsetY, width: bounds.width, height: bounds.height };
}
