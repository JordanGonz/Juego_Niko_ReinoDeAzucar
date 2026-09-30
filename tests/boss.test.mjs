import test from "node:test";
import assert from "node:assert/strict";
import { SalamandraBoss } from "../app/game/bosses/SalamandraBoss.ts";
import { LEVELS, getGoalX } from "../app/game/levels.ts";

const player = { x: 4210, y: 408, facing: 1, collisionBounds: { width: 38, height: 50 } };

test("la salamandra avisa, embiste y deja una ventana para golpear", () => {
  const boss = new SalamandraBoss();
  assert.equal(boss.active, false);
  assert.equal(boss.strike(player), false);
  boss.update({ ...player, x: 3400 });
  assert.equal(boss.active, false);
  boss.update(player);
  assert.equal(boss.phase, "warning");
  for (let i = 0; i < 72; i++) boss.update(player);
  assert.equal(boss.phase, "charging");
  assert.equal(boss.strike(player), false);
  for (let i = 0; i < 48; i++) boss.update(player);
  assert.equal(boss.phase, "exposed");
  assert.equal(boss.strike({ ...player, facing: -1 }), true);
  assert.equal(boss.health, 4);
  assert.equal(boss.strike(player), false);
});

test("el salto ígneo avisa, se eleva y cae en el punto anunciado", () => {
  const boss = new SalamandraBoss();
  boss.active = true;
  boss.phase = "warningLeap";
  boss.targetX = 4150;
  boss.timer = 1;
  boss.update(player);
  assert.equal(boss.phase, "leaping");
  for (let i = 0; i < 22; i++) boss.update(player);
  assert.ok(boss.y < 300);
  for (let i = 0; i < 22; i++) boss.update(player);
  assert.equal(boss.phase, "impact");
  assert.equal(boss.x, 4150);
  assert.equal(boss.y, 458 - boss.height);
});

test("cinco golpes válidos derrotan al jefe y no permiten daños posteriores", () => {
  const boss = new SalamandraBoss();
  boss.active = true;
  boss.x = 4250;
  for (let hit = 0; hit < boss.maxHealth; hit++) {
    boss.phase = "exposed";
    boss.invulnerable = 0;
    assert.equal(boss.strike(player), true);
  }
  assert.equal(boss.health, 0);
  assert.equal(boss.defeated, true);
  boss.update(player);
  assert.equal(boss.strike(player), false);
});

test("el jefe tiene arena y no comparte posición con la salida", () => {
  const boss = new SalamandraBoss();
  const level = LEVELS[1];
  const arena = level.platforms[6];
  assert.ok(arena[2] >= 900);
  assert.ok(boss.x >= arena[0] + 200);
  assert.ok(boss.x + boss.width < getGoalX(level.width) - 40);
});
