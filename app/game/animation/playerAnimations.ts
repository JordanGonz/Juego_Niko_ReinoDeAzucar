import type { Player, PlayerState } from "../types";
import type { AnimationClip } from "./AnimationClip";

export const PLAYER_ANIMATION_CLIPS: Record<PlayerState, AnimationClip> = {
  idle: { frames: [0, 1, 2, 1], frameDuration: 0.2, loop: true },
  run: { frames: [4, 5, 6, 7, 8, 9], frameDuration: 0.085, loop: true, events: [{ frame: 1, name: "footstep" }, { frame: 4, name: "footstep" }] },
  jumpStart: { frames: [10, 11], frameDuration: 0.04, loop: false },
  jumpUp: { frames: [14, 15], frameDuration: 0.1, loop: true },
  fall: { frames: [16, 15], frameDuration: 0.12, loop: true },
  land: { frames: [17, 18, 19], frameDuration: 0.04, loop: false, events: [{ frame: 1, name: "land" }] },
  skid: { frames: [20, 19], frameDuration: 0.06, loop: true },
  hurt: { frames: [21, 22], frameDuration: 0.08, loop: true },
  death: { frames: [23, 24, 23, 24], frameDuration: 0.12, loop: false },
  victory: { frames: [25, 26, 25, 26], frameDuration: 0.12, loop: true },
};

export function resolvePlayerState(player: Player, gameState: string): PlayerState {
  if (gameState === "lost") return "death";
  if (gameState === "finishing" || gameState === "won") return "victory";
  if (player.hurtTimer > 0) return "hurt";
  if (player.skidTimer > 0 && player.grounded) return "skid";
  if (player.landingTimer > 0 && player.grounded) return "land";
  if (player.jumpStartTimer > 0 && !player.grounded) return "jumpStart";
  if (!player.grounded) return player.vy < 0 ? "jumpUp" : "fall";
  return Math.abs(player.vx) >= 0.35 ? "run" : "idle";
}
