import type { Player } from "../types";
import type { PlayerMovementConfig } from "./tuning";

export function moveTowards(value: number, target: number, amount: number) {
  if (value < target) return Math.min(value + amount, target);
  if (value > target) return Math.max(value - amount, target);
  return target;
}

export function applyJumpCut(velocityY: number, multiplier: number) {
  return velocityY < 0 ? velocityY * multiplier : velocityY;
}

export function applyGravity(velocityY: number, config: PlayerMovementConfig) {
  const nearApex = Math.abs(velocityY) < 1.2;
  const multiplier = velocityY > 0
    ? config.fallGravityMultiplier
    : nearApex ? config.apexGravityMultiplier : 1;
  return Math.min(config.maxFallSpeed, velocityY + config.gravity * multiplier);
}

export function bufferJump(player: Player, duration: number) {
  player.jumpBufferTimer = duration;
}

export function refreshCoyoteTime(player: Player, duration: number) {
  if (player.grounded) player.coyoteTimer = duration;
}

export function canUseBufferedJump(player: Player) {
  return player.jumpBufferTimer > 0 && (player.grounded || player.coyoteTimer > 0);
}

export function consumeBufferedJump(player: Player, velocity: number, jumpStartDuration: number) {
  if (!canUseBufferedJump(player)) return false;
  player.vy = -velocity;
  player.grounded = false;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;
  player.jumpStartTimer = jumpStartDuration;
  player.landingTimer = 0;
  return true;
}

export function updatePlayerTimers(player: Player, stepSeconds: number) {
  player.coyoteTimer = Math.max(0, player.coyoteTimer - stepSeconds);
  player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - stepSeconds);
  player.jumpStartTimer = Math.max(0, player.jumpStartTimer - stepSeconds);
  player.landingTimer = Math.max(0, player.landingTimer - stepSeconds);
  player.skidTimer = Math.max(0, player.skidTimer - stepSeconds);
  player.hurtTimer = Math.max(0, player.hurtTimer - stepSeconds);
  player.runDustTimer = Math.max(0, player.runDustTimer - stepSeconds);
}
