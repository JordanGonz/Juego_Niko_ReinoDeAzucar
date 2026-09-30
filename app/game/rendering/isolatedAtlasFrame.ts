import { atlasBounds } from "./atlasBounds.ts";
import { dominantSpriteMask } from "./player/dominantSpriteMask.ts";
import { removeOpaqueAtlasBackground } from "./player/opaqueAtlasBackground.ts";

/** Extract one hand-painted atlas pose without pieces from adjacent poses. */
export function isolatedAtlasFrame(image: CanvasImageSource, columns: number, rows: number,
  column: number, row: number, padding = { left: 0, right: 0, top: 0, bottom: 0 }): HTMLCanvasElement {
  const source = atlasBounds(image, columns, rows, column, row);
  const bitmap = image as HTMLImageElement;
  const imageWidth = bitmap.naturalWidth || bitmap.width;
  const imageHeight = bitmap.naturalHeight || bitmap.height;
  const left = Math.max(0, source.x - padding.left);
  const top = Math.max(0, source.y - padding.top);
  const right = Math.min(imageWidth, source.x + source.width + padding.right);
  const bottom = Math.min(imageHeight, source.y + source.height + padding.bottom);
  const canvas = document.createElement("canvas");
  canvas.width = right - left;
  canvas.height = bottom - top;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;
  context.drawImage(image, left, top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  removeOpaqueAtlasBackground(frame.data, canvas.width, canvas.height);
  const mask = dominantSpriteMask(frame.data, canvas.width, canvas.height,
    padding.left || padding.right ? source.x + source.width / 2 - left : undefined);
  for (let index = 0; index < mask.length; index++) {
    if (!mask[index]) frame.data[index * 4 + 3] = 0;
  }
  context.putImageData(frame, 0, 0);
  let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    if (frame.data[(y * canvas.width + x) * 4 + 3] <= 10) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  if (maxX < minX) return canvas;
  const trimmed = document.createElement("canvas");
  trimmed.width = maxX - minX + 1;
  trimmed.height = maxY - minY + 1;
  trimmed.getContext("2d")?.drawImage(canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
  return trimmed;
}
