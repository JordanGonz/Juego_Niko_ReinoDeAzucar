import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("la aplicación ya no conserva las expectativas del starter", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ]);

  assert.match(page, /new Game\(canvas, handleGameEvent\)/);
  assert.match(page, /<canvas/);
  assert.match(layout, /Niko y el Reino de Azúcar/);
  assert.doesNotMatch(page, /SkeletonPreview|Building your site/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
