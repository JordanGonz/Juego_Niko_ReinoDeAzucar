import test from "node:test";
import assert from "node:assert/strict";
import { explicitAtlasRegion } from "../app/game/rendering/atlasRegions.ts";
import { AssetBiomeRenderer } from "../app/game/rendering/world/AssetBiomeRenderer.ts";

test("recortes de los tres mundos no incluyen piezas vecinas", () => {
  for (const world of ["sky-ruins", "crystal-cave", "volcano-or-canyon"]) {
    const width = world === "crystal-cave" ? 1448 : 1536;
    const height = world === "crystal-cave" ? 1086 : 1024;
    for (let row = 0; row < 2; row++) {
      let end = 0;
      for (let column = 0; column < 4; column++) {
        const rect = explicitAtlasRegion(`/game/worlds/${world}/tiles/atlas.png`, column, row, width, height);
        assert.ok(rect.x >= end);
        assert.ok(rect.x + rect.width <= width);
        assert.ok(rect.y + rect.height <= height);
        end = rect.x + rect.width;
      }
    }
  }
});

test("la moneda excluye los restos verdes del peligro vecino", () => {
  const rect = explicitAtlasRegion("/game/worlds/meadow/gameplay/meadow_gameplay_atlas.png", 3, 0, 1536, 1024);
  assert.equal(rect.x, 995);
  assert.equal(rect.width, 210);
});

test("banderas y peligros se dibujan en sus bounds de juego", () => {
  for (const biome of ["canyon", "cave", "crystal"]) {
    const calls = [];
    const image = { naturalWidth: 1536, naturalHeight: 1024, src: "test" };
    new AssetBiomeRenderer(biome).renderGameplay({
      ctx: { drawImage(...args) { calls.push(args); } }, width: 960,
      assets: { get(id) { return id.endsWith("-gameplay") ? image : null; } },
      view: { cameraX: 0, level: { platforms: [] },
        checkpoints: [{ x: 200, y: 392, activated: false }],
        hazards: [{ x: 400, y: 432, width: 60, height: 18 }] },
    });
    assert.deepEqual(calls[0].slice(5), [186,392,46,58]);
    assert.deepEqual(calls[1].slice(5), [400,432,60,18]);
  }
});
