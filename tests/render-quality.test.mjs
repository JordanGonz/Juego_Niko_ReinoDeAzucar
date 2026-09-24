import assert from "node:assert/strict";
import test from "node:test";
import { canvasPixelRatio } from "../app/game/rendering/renderQuality.ts";

test("limita la resolución del lienzo en teléfonos sin cambiar la lógica de juego", () => {
  assert.equal(canvasPixelRatio(960, 3, true), 1.25);
  assert.equal(canvasPixelRatio(960, 2, false), 2);
  assert.equal(canvasPixelRatio(960, 0, true), 1);
  assert.ok(canvasPixelRatio(3000, 3, false) < 1.5);
});
