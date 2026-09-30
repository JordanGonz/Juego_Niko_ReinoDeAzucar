import test from "node:test";
import assert from "node:assert/strict";
import { ADVENTURE_SAVE_KEY, readAdventureSave, writeAdventureSave } from "../app/game/core/adventureSave.ts";
import { resolveWorldExit } from "../app/game/core/worldConnections.ts";
import { createPlayer } from "../app/game/entities/Player.ts";
import { LEVELS, PROGRESS_KEY } from "../app/game/levels.ts";

const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test("migra el desbloqueo anterior sin perder el jefe superado", () => {
  const local = storage();
  local.setItem(PROGRESS_KEY, "2");
  const save = readAdventureSave(local);
  assert.equal(save.unlockedLevel, 2);
  assert.equal(save.regions[1].bossDefeated, true);
  assert.equal(save.regions[1].completed, true);
});

test("guarda y recupera coleccionables, checkpoint y avance sin duplicarlos", () => {
  const local = storage();
  const save = readAdventureSave(local);
  save.unlockedLevel = 2;
  save.currentRegion = 2;
  save.score = 4200;
  save.regions[0].coins = [0, 1];
  save.regions[0].pickups = [0];
  save.regions[0].completed = true;
  save.regions[1].checkpointId = LEVELS[1].checkpoints[0].id;
  writeAdventureSave(local, save);
  const restored = readAdventureSave(local);
  assert.deepEqual(restored.regions[0].coins, [0, 1]);
  assert.deepEqual(restored.regions[0].pickups, [0]);
  assert.equal(restored.regions[1].checkpointId, save.regions[1].checkpointId);
  assert.equal(restored.score, 4200);
  assert.equal(restored.currentRegion, 2);
  assert.equal(local.getItem(PROGRESS_KEY), "2");
  assert.ok(local.getItem(ADVENTURE_SAVE_KEY));
});

test("rechaza índices falsos o fuera del mapa al leer el guardado", () => {
  const local = storage();
  local.setItem(ADVENTURE_SAVE_KEY, JSON.stringify({ unlockedLevel: 999, regions: [{ coins: [0, 0, -1, 1000], pickups: [800] }] }));
  const save = readAdventureSave(local);
  assert.equal(save.unlockedLevel, LEVELS.length - 1);
  assert.deepEqual(save.regions[0].coins, [0]);
  assert.deepEqual(save.regions[0].pickups, []);
});

test("un guardado antiguo retoma la última región desbloqueada; uno nuevo recuerda su posición", () => {
  const local = storage();
  local.setItem(PROGRESS_KEY, "3");
  assert.equal(readAdventureSave(local).currentRegion, 3);
  local.setItem(ADVENTURE_SAVE_KEY, JSON.stringify({ currentRegion: 2, unlockedLevel: 3 }));
  assert.equal(readAdventureSave(local).currentRegion, 2);
});

test("las salidas principales se cruzan caminando y el jefe bloquea el siguiente paso", () => {
  const player = createPlayer();
  player.x = LEVELS[1].width - player.collisionBounds.width;
  assert.equal(resolveWorldExit(1, player, false, true, 1, false), null);
  assert.equal(resolveWorldExit(1, player, false, true, 1, true)?.destination, 2);
  player.x = 0;
  assert.equal(resolveWorldExit(1, player, true, false, 2, true)?.destination, 0);
});

test("doble salto abre la salida alta y la grieta devuelve a la Pradera", () => {
  const player = createPlayer();
  player.x = 3280;
  player.y = -25;
  assert.equal(resolveWorldExit(0, player, false, false, 1, true), null);
  assert.equal(resolveWorldExit(0, player, false, false, 2, true)?.destination, 2);
  player.x = 3130;
  player.y = 505;
  assert.equal(resolveWorldExit(2, player, false, false, 2, true)?.destination, 0);
  const caveFloor = LEVELS[2].platforms.filter(([x, y, width]) => y === 458 && x <= 3130 && x + width > 3130);
  assert.equal(caveFloor.length, 0);
});
