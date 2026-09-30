import assert from "node:assert/strict";
import test from "node:test";
import { dominantSpriteMask } from "../app/game/rendering/player/dominantSpriteMask.ts";
import { removeOpaqueAtlasBackground } from "../app/game/rendering/player/opaqueAtlasBackground.ts";

test("Niko conserva su silueta y descarta una pose vecina del atlas", () => {
  const width = 8;
  const pixels = new Uint8ClampedArray(width * 5 * 4);
  const alpha = (x, y, value) => { pixels[(y * width + x) * 4 + 3] = value; };
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) alpha(x, y, 255);
  alpha(0, 2, 60); // borde suavizado de Niko
  alpha(6, 1, 255);
  alpha(6, 2, 255); // fragmento de la pose siguiente

  const mask = dominantSpriteMask(pixels, width, 5);
  assert.equal(mask[2 * width + 2], 1);
  assert.equal(mask[2 * width], 1);
  assert.equal(mask[1 * width + 6], 0);
  assert.equal(mask[2 * width + 6], 0);
});

test("un fondo opaco degradado se vuelve transparente sin borrar la silueta", () => {
  const width = 16, height = 12;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const at = (y * width + x) * 4;
    pixels.set([65 + x * 2, 55 + y * 3, 90 + x, 255], at);
    if (x >= 5 && x <= 10 && y >= 2 && y <= 9) pixels.set([10, 210, 205, 255], at);
  }
  removeOpaqueAtlasBackground(pixels, width, height);
  assert.equal(pixels[(6 * width + 0) * 4 + 3], 0);
  assert.equal(pixels[(6 * width + 7) * 4 + 3], 255);
});
