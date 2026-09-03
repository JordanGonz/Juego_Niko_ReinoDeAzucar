import type { Level } from "../types";

export type PlayerMovementConfig = {
  maxRunSpeed: number;
  boostMaxRunSpeed: number;
  groundAcceleration: number;
  airAcceleration: number;
  groundDeceleration: number;
  airDeceleration: number;
  gravity: number;
  fallGravityMultiplier: number;
  apexGravityMultiplier: number;
  maxFallSpeed: number;
  jumpVelocity: number;
  boostJumpBonus: number;
  jumpCutMultiplier: number;
  coyoteTime: number;
  jumpBufferTime: number;
  landingThreshold: number;
  hardLandingThreshold: number;
  skidThreshold: number;
  skidDuration: number;
  landingDuration: number;
  jumpStartDuration: number;
  hurtDuration: number;
  runDustInterval: number;
};

export const PLAYER_MOVEMENT: PlayerMovementConfig = {
  maxRunSpeed: 6,
  boostMaxRunSpeed: 8.2,
  groundAcceleration: 0.9,
  airAcceleration: 0.55,
  groundDeceleration: 0.85,
  airDeceleration: 0.12,
  gravity: 0.75,
  fallGravityMultiplier: 1.28,
  apexGravityMultiplier: 0.88,
  maxFallSpeed: 15,
  jumpVelocity: 13.8,
  boostJumpBonus: 1.8,
  jumpCutMultiplier: 0.55,
  coyoteTime: 0.1,
  jumpBufferTime: 0.1,
  landingThreshold: 5.5,
  hardLandingThreshold: 11,
  skidThreshold: 3.2,
  skidDuration: 0.12,
  landingDuration: 0.11,
  jumpStartDuration: 0.07,
  hurtDuration: 0.22,
  runDustInterval: 0.14,
};

export function movementForLevel(level: Level): PlayerMovementConfig {
  return { ...PLAYER_MOVEMENT, jumpVelocity: level.jumpForce };
}
