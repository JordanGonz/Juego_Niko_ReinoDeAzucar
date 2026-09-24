import { atlasBounds } from "../atlasBounds.ts";
import type { Biome } from "../../types.ts";

type PlatformSprite = { x: number; y: number; width: number; biome: Biome; index: number };

// Repeat painted chunks near their native proportions and clip at the collider edge.
export function drawPlatformSprite(ctx: CanvasRenderingContext2D, atlas: HTMLImageElement, platform: PlatformSprite) {
  const { x, y, width, biome, index } = platform;
  const meadow = biome === "meadow";
  const rows = meadow ? 1 : 2;
  ctx.save();
  if (y >= 450) {
    const tileWidth = meadow ? 190 : 210;
    const tileHeight = meadow ? 134 : 126;
    const topOffset = meadow ? 40 : 5;
    ctx.beginPath();
    ctx.rect(x, y - topOffset - 3, width, tileHeight + 8);
    ctx.clip();
    for (let offset = 0, part = 0; offset < width; offset += tileWidth - 15, part++) {
      const source = atlasBounds(atlas, 4, rows, (index + part) % 3, 0);
      ctx.drawImage(atlas, source.x, source.y, source.width, source.height,
        Math.round(x + offset), Math.round(y - topOffset), tileWidth, tileHeight);
    }
  } else {
    const source = atlasBounds(atlas, 4, rows, 3, meadow ? 0 : 1);
    const visualHeight = Math.min(105, Math.max(70, width * .58));
    ctx.drawImage(atlas, source.x, source.y, source.width, source.height,
      Math.round(x), Math.round(y - (meadow ? visualHeight * .27 : 5)), Math.round(width), Math.round(visualHeight));
  }
  ctx.restore();
}
