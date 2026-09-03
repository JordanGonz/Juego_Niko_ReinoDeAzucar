import assert from "node:assert/strict";
import test from "node:test";
import { Camera } from "../app/game/camera/Camera.ts";
import { landPlayer } from "../app/game/physics/collision.ts";
import { clampPlayerX, moveEnemy } from "../app/game/physics/movement.ts";
import { createInitialSession, nextUnlockedLevel } from "../app/game/core/session.ts";

test("la colisión aterriza al jugador sobre una plataforma", () => {
  const player = { x: 30, y: 80, w: 38, h: 50, vx: 0, vy: 8, grounded: false, facing: 1, inv: 0 };
  const level = { platforms: [[0, 120, 200, 30]] };
  const landing = landPlayer(player, level, 112);
  assert.ok(landing);
  assert.equal(player.y, 70);
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
  assert.equal(clampPlayerX(-20, 38, 1000), 0);
  assert.equal(clampPlayerX(990, 38, 1000), 962);
  assert.equal(Camera.clamp(-30, 3600, 960), 0);
  assert.equal(Camera.clamp(3000, 3600, 960), 2640);
});
