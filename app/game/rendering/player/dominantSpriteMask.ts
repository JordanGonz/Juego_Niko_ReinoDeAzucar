/** Keep the pose in a cell, not pieces of its neighboring atlas poses. */
export function dominantSpriteMask(pixels: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const count = width * height;
  const visited = new Uint8Array(count);
  const queue = new Int32Array(count);
  let largest: number[] = [];

  for (let start = 0; start < count; start++) {
    if (visited[start] || pixels[start * 4 + 3] <= 100) continue;
    let head = 0;
    let tail = 0;
    const component: number[] = [];
    queue[tail++] = start;
    visited[start] = 1;

    while (head < tail) {
      const index = queue[head++];
      component.push(index);
      const x = index % width;
      const y = Math.floor(index / width);
      const neighbors = [x > 0 ? index - 1 : -1, x + 1 < width ? index + 1 : -1,
        y > 0 ? index - width : -1, y + 1 < height ? index + width : -1];
      for (const neighbor of neighbors) {
        if (neighbor < 0 || visited[neighbor] || pixels[neighbor * 4 + 3] <= 100) continue;
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }
    }
    if (component.length > largest.length) largest = component;
  }

  const mask = new Uint8Array(count);
  for (const index of largest) mask[index] = 1;
  // Restore the antialiased one-pixel edge without reconnecting another pose.
  for (const index of largest) {
    const x = index % width;
    const y = Math.floor(index / width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const neighbor = ny * width + nx;
      if (pixels[neighbor * 4 + 3] <= 100) mask[neighbor] = 1;
    }
  }
  return mask;
}
