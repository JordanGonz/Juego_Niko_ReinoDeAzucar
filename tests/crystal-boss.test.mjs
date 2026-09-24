import assert from "node:assert/strict";
import test from "node:test";
import { CrystalGuardianBoss } from "../app/game/bosses/CrystalGuardianBoss.ts";
import { LEVELS, getGoalX } from "../app/game/levels.ts";
import { GLOBAL_ASSETS, worldAssetManifest } from "../app/game/assets/gameAssets.ts";

const player = () => ({ x: 4510, y: 408, facing: 1, collisionBounds: { width: 38, height: 50 } });

test("el último mundo reserva una arena y bloquea la meta con un jefe propio", () => {
  const level = LEVELS.at(-1);
  const boss = new CrystalGuardianBoss();
  const ground = level.platforms[7];
  assert.equal(level.biome, "crystal");
  assert.ok(ground[2] >= 1100);
  assert.ok(boss.x > ground[0] + 500);
  assert.ok(boss.x + boss.width < getGoalX(level.width) - 40);
  boss.x = 5220;
  assert.ok(boss.x + boss.width < getGoalX(level.width) - 40);
  assert.ok(level.checkpoints.some((checkpoint) => checkpoint.id === "crystal-boss"));
  assert.ok(worldAssetManifest("crystal").includes(GLOBAL_ASSETS.crystalGuardian));
});

test("el Guardián Celeste avisa antes de sus cuatro ataques y deja ventanas de castigo", () => {
  const boss = new CrystalGuardianBoss();
  const target = player();
  boss.update({ ...target, x: 4300 });
  assert.equal(boss.active, false);
  const seen = new Set();
  for (let tick = 0; tick < 1800; tick++) {
    boss.update(target);
    seen.add(boss.phase);
  }
  for (const phase of ["awakening", "warningDash", "dash", "warningSlam", "leap", "impact",
    "warningBolts", "barrage", "warningWaves", "waves", "exposed"]) assert.ok(seen.has(phase), phase);
});

test("requiere nueve ventanas distintas, acelera al final y no recibe daño tras caer", () => {
  const boss = new CrystalGuardianBoss();
  boss.active = true;
  boss.x = 5000;
  const target = { ...player(), x: 4970 };
  for (let hit = 0; hit < boss.maxHealth; hit++) {
    boss.phase = "exposed";
    boss.invulnerable = 0;
    assert.equal(boss.strike(target), true);
    assert.equal(boss.strike(target), false);
    if (hit === 5) assert.equal(boss.enraged, true);
  }
  assert.equal(boss.defeated, true);
  assert.equal(boss.strike(target), false);
});

test("los proyectiles y las ondas se consumen al golpear", () => {
  const boss = new CrystalGuardianBoss();
  boss.active = true;
  const target = player();
  boss.phase = "barrage";
  boss.timer = 23;
  boss.update(target);
  assert.equal(boss.bolts.length, 3);
  const shot = boss.bolts[0];
  const inShot = { ...target, x: shot.x - 19, y: shot.y - 25 };
  assert.equal(boss.consumeHazardHit(inShot), true);
  assert.equal(boss.bolts.length, 2);
  boss.bolts.length = 0;
  boss.phase = "waves";
  boss.timer = 28;
  boss.update(target);
  assert.equal(boss.waves.length, 2);
  boss.waves[0].x = target.x;
  assert.equal(boss.consumeHazardHit(target), true);
  assert.equal(boss.waves.length, 1);
});

test("el objetivo anunciado no cambia en el último instante", () => {
  const boss = new CrystalGuardianBoss();
  boss.active = true;
  boss.phase = "warningSlam";
  boss.timer = 1;
  boss.targetX = 4700;
  boss.update({ ...player(), x: 5200 });
  assert.equal(boss.phase, "leap");
  assert.equal(boss.targetX, 4700);

  boss.phase = "warningDash";
  boss.timer = 1;
  boss.facing = -1;
  boss.update({ ...player(), x: 5200 });
  assert.equal(boss.phase, "dash");
  assert.equal(boss.facing, -1);
});
