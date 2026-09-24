import test from "node:test";
import assert from "node:assert/strict";
import { drawPlatformSprite } from "../app/game/rendering/world/platformSprite.ts";

test("plataformas largas repiten tramos pequeños sin estirar una sola textura", () => {
  for (const biome of ["meadow", "canyon", "cave", "crystal"]) {
    const calls = [];
    const ctx = { save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, drawImage(...args) { calls.push(args); } };
    const atlas = { naturalWidth: 1536, naturalHeight: 1024, src: "atlas" };
    drawPlatformSprite(ctx, atlas, { x: 100, y: 458, width: 940, biome, index: 0 });
    assert.ok(calls.length >= 5, biome);
    assert.ok(calls.every(args => args[7] <= 210), biome);
  }
});
