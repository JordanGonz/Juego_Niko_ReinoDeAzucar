import type {
  Player,
  PlayerState,
} from "../types";
import type {
  AnimationClip,
} from "./AnimationClip";

export const PLAYER_ANIMATION_CLIPS: Record<
  PlayerState,
  AnimationClip
> = {
  idle: {
    frames: [0, 1, 2, 3, 2, 1],
    frameDuration: 0.18,
    loop: true,
  },

  run: {
    frames: [4, 5, 6, 7, 8, 9],
    frameDuration: 0.085,
    loop: true,
    events: [
      {
        frame: 1,
        name: "footstep",
      },
      {
        frame: 4,
        name: "footstep",
      },
    ],
  },

  jumpStart: {
    frames: [10, 11],
    frameDuration: 0.06,
    loop: false,
  },

  jumpUp: {
    frames: [12, 13],
    frameDuration: 0.1,
    loop: true,
  },

  fall: {
    frames: [14, 15],
    frameDuration: 0.12,
    loop: true,
  },

  land: {
    frames: [16, 17, 18],
    frameDuration: 0.055,
    loop: false,
    events: [
      {
        frame: 1,
        name: "land",
      },
    ],
  },

  skid: {
    frames: [19, 20],
    frameDuration: 0.08,
    loop: true,
  },

  hurt: {
    frames: [21, 22],
    frameDuration: 0.1,
    loop: true,
  },

  death: {
    frames: [23, 24, 25, 26],
    frameDuration: 0.12,
    loop: false,
  },

  victory: {
    frames: [27, 28, 29, 30],
    frameDuration: 0.12,
    loop: true,
  },
};

export function resolvePlayerState(
  player: Player,
  gameState: string,
): PlayerState {
  if (gameState === "lost") {
    return "death";
  }

  if (
    gameState === "finishing" ||
    gameState === "won"
  ) {
    return "victory";
  }

  if (player.hurtTimer > 0) {
    return "hurt";
  }

  if (
    player.skidTimer > 0 &&
    player.grounded
  ) {
    return "skid";
  }

  if (
    player.landingTimer > 0 &&
    player.grounded
  ) {
    return "land";
  }

  if (
    player.jumpStartTimer > 0 &&
    !player.grounded
  ) {
    return "jumpStart";
  }

  if (!player.grounded) {
    return player.vy < 0
      ? "jumpUp"
      : "fall";
  }

  return Math.abs(player.vx) >= 0.35
    ? "run"
    : "idle";
}