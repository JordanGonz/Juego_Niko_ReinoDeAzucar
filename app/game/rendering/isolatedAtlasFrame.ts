import { atlasBounds } from "./atlasBounds.ts";
import { dominantSpriteMask } from "./player/dominantSpriteMask.ts";

/** Extract one hand-painted atlas pose without pieces from adjacent poses. */
export function isolatedAtlasFrame(image: CanvasImageSource, columns: number, rows: number,
  column: number, row: number): HTMLCanvasElement {
  const source = atlasBounds(image, columns, rows, column, row);
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;
  context.drawImage(image, source.x, source.y, source.width, source.height,
    0, 0, source.width, source.height);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const mask = dominantSpriteMask(frame.data, canvas.width, canvas.height);
  for (let index = 0; index < mask.length; index++) {
    if (!mask[index]) frame.data[index * 4 + 3] = 0;
  }
  context.putImageData(frame, 0, 0);
  return canvas;
}
