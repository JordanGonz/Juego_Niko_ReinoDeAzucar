import test from "node:test";
import assert from "node:assert/strict";
import { SalamandraBoss } from "../app/game/bosses/SalamandraBoss.ts";

const player = { x: 3665, y: 408, facing: 1, collisionBounds: { width: 38, height: 50 } };

test("la salamandra avisa, embiste y deja una ventana para golpear", () => {
  const boss = new SalamandraBoss();
  assert.equal(boss.active, false);
  assert.equal(boss.strike(player), false);
  boss.update({ ...player, x: 3400 });
  assert.equal(boss.active, false);
  boss.update(player);
  assert.equal(boss.phase, "warning");
  for (let i = 0; i < 62; i++) boss.update(player);
  assert.equal(boss.phase, "charging");
  assert.equal(boss.strike(player), false);
  for (let i = 0; i < 30; i++) boss.update(player);
  assert.equal(boss.phase, "exposed");
  assert.equal(boss.strike(player), true);
  assert.equal(boss.health, 4);
  assert.equal(boss.strike(player), false);
});

test("cinco golpes válidos derrotan al jefe y no permiten daños posteriores", () => {
  const boss = new SalamandraBoss();
  boss.active = true;
  boss.x = 3715;
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
