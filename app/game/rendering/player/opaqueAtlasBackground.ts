/**
 * Hand-painted sprite sheets have an opaque, smoothly graded backdrop.
 * Estimate that backdrop from the sides of each row before finding the
 * connected character silhouette. This runs once per cached animation pose.
 */
export function removeOpaqueAtlasBackground(pixels: Uint8ClampedArray, width: number, height: number) {
  if (width < 8 || height < 8) return;
  let opaque = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 250) opaque++;
  if (opaque < width * height * .88) return;

  for (let y = 0; y < height; y++) {
    const left = (y * width + 2) * 4;
    const right = (y * width + width - 3) * 4;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const mix = x / (width - 1);
      const red = pixels[left] * (1 - mix) + pixels[right] * mix;
      const green = pixels[left + 1] * (1 - mix) + pixels[right + 1] * mix;
      const blue = pixels[left + 2] * (1 - mix) + pixels[right + 2] * mix;
      const distance = Math.max(
        Math.abs(pixels[index] - red),
        Math.abs(pixels[index + 1] - green),
        Math.abs(pixels[index + 2] - blue),
      );
      const opacity = Math.max(0, Math.min(1, (distance - 27) / 62));
      pixels[index + 3] = Math.round(pixels[index + 3] * opacity);
    }
  }
}
