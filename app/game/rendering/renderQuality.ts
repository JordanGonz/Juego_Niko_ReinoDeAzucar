const LOGICAL_HEIGHT = 540;
const MAX_CANVAS_PIXELS = 2_100_000;

export function canvasPixelRatio(logicalWidth: number, deviceRatio: number, coarsePointer: boolean) {
  const safeRatio = Number.isFinite(deviceRatio) && deviceRatio > 0 ? deviceRatio : 1;
  const qualityCap = coarsePointer ? 1.25 : 2;
  const pixelCap = Math.sqrt(MAX_CANVAS_PIXELS / (logicalWidth * LOGICAL_HEIGHT));
  return Math.max(1, Math.min(safeRatio, qualityCap, pixelCap));
}
