import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayerState } from "../app/game/animation/playerAnimations.ts";
import { Camera } from "../app/game/camera/Camera.ts";
import { collisionRect, createPlayer, visualRect } from "../app/game/entities/Player.ts";
import { consumeFixedSteps, FIXED_STEP_MS } from "../app/game/core/GameLoop.ts";
import { createInitialSession, nextUnlockedLevel } from "../app/game/core/session.ts";
import { landPlayer } from "../app/game/physics/collision.ts";
import { clampPlayerX, moveEnemy } from "../app/game/physics/movement.ts";
import { applyGravity, applyJumpCut, bufferJump, consumeBufferedJump } from "../app/game/physics/playerMovement.ts";
import { PLAYER_MOVEMENT } from "../app/game/physics/tuning.ts";

test("la colisión aterriza usando el ancho inferior de la hitbox", () => {
  const player = createPlayer();
  player.x = 30; player.y = 80; player.vy = 8; player.grounded = false;
  const level = { platforms: [[0, 120, 200, 30]] };
  const landing = landPlayer(player, level, 112);
  assert.ok(landing);
  assert.equal(player.y, 74);
  assert.equal(player.vy, 0);
  assert.equal(player.grounded, true);
});

test("la patrulla actual rebota y queda dentro de sus límites", () => {
  const enemy = { x: 99.5, y: 80, vx: 1.15, minX: 20, maxX: 100, alive: true };
  moveEnemy(enemy);
  assert.equal(enemy.x, 100);
  assert.equal(enemy.vx, -1.15);
});

test("los mundos se desbloquean de forma secuencial sin retroceder", () => {
  assert.equal(nextUnlockedLevel(0, 0, 4), 1);
  assert.equal(nextUnlockedLevel(1, 1, 4), 2);
  assert.equal(nextUnlockedLevel(2, 0, 4), 2);
  assert.equal(nextUnlockedLevel(3, 3, 4), 3);
});

test("el reinicio de sesión recupera los valores originales", () => {
  assert.deepEqual(createInitialSession(), { score: 0, coins: 0, lives: 3, power: "", levelIndex: 0 });
});

test("jugador y cámara respetan sus límites", () => {
  assert.equal(clampPlayerX(-20, 30, 1000), 0);
  assert.equal(clampPlayerX(990, 30, 1000), 970);
  assert.equal(Camera.clamp(-30, 3600, 960), 0);
  assert.equal(Camera.clamp(3000, 3600, 960), 2640);
});

test("coyote time permite consumir un salto después de abandonar el borde", () => {
  const player = createPlayer();
  player.grounded = false; player.coyoteTimer = 0.08;
  bufferJump(player, 0.1);
  assert.equal(consumeBufferedJump(player, 13.8, 0.07), true);
  assert.equal(player.vy, -13.8);
  assert.equal(player.coyoteTimer, 0);
});

test("jump buffer espera hasta que el jugador toque suelo", () => {
  const player = createPlayer();
  player.grounded = false; player.coyoteTimer = 0;
  bufferJump(player, 0.1);
  assert.equal(consumeBufferedJump(player, 13.8, 0.07), false);
  player.grounded = true;
  assert.equal(consumeBufferedJump(player, 13.8, 0.07), true);
});

test("jump cut reduce suavemente la velocidad ascendente", () => {
  assert.equal(applyJumpCut(-12, 0.55), -6.6000000000000005);
  assert.equal(applyJumpCut(4, 0.55), 4);
});

test("la gravedad respeta la velocidad terminal", () => {
  assert.equal(applyGravity(20, PLAYER_MOVEMENT), PLAYER_MOVEMENT.maxFallSpeed);
});

test("collision bounds y visual bounds son independientes", () => {
  const player = createPlayer();
  const collision = collisionRect(player);
  const visual = visualRect(player);
  assert.equal(collision.width, 30);
  assert.equal(visual.width, 44);
  assert.ok(visual.x < collision.x);
  assert.ok(visual.height > collision.height);
});

test("el estado visual pasa de idle a run y de salto a caída", () => {
  const player = createPlayer();
  assert.equal(resolvePlayerState(player, "playing"), "idle");
  player.vx = 3;
  assert.equal(resolvePlayerState(player, "playing"), "run");
  player.grounded = false; player.vy = -4;
  assert.equal(resolvePlayerState(player, "playing"), "jumpUp");
  player.vy = 2;
  assert.equal(resolvePlayerState(player, "playing"), "fall");
});

test("fixed timestep produce pasos estables y limita recuperación", () => {
  assert.equal(consumeFixedSteps(0, FIXED_STEP_MS * 3).steps, 3);
  assert.equal(consumeFixedSteps(0, FIXED_STEP_MS * 20).steps, 5);
  const half = consumeFixedSteps(0, FIXED_STEP_MS / 2);
  assert.equal(half.steps, 0);
  assert.equal(consumeFixedSteps(half.accumulator, FIXED_STEP_MS / 2).steps, 1);
});
