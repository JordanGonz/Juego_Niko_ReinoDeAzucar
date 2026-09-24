// Explicit regions for hand-painted sheets: their objects are not on a uniform grid.
type Rect = readonly [number, number, number, number];
const tiles: Record<string, { size: readonly [number, number]; cells: readonly Rect[] }> = {
  "sky-ruins": { size: [1536, 1024], cells: [
    [85,225,320,230],[445,225,350,235],[875,225,310,235],[1255,275,180,180],
    [45,625,195,145],[265,625,510,145],[815,600,365,250],[1230,640,265,90],
  ] },
  "crystal-cave": { size: [1448,1086], cells: [
    [45,285,285,245],[425,285,310,245],[815,285,325,245],[1195,360,180,175],
    [80,685,200,135],[330,685,390,130],[765,685,365,180],[1175,685,210,130],
  ] },
  "volcano-or-canyon": { size: [1536,1024], cells: [
    [40,170,320,285],[390,170,400,285],[815,170,390,285],[1265,230,225,225],
    [55,645,240,165],[340,645,450,175],[835,570,365,280],[1245,535,255,315],
  ] },
};

export function explicitAtlasRegion(src: string, column: number, row: number, width: number, height: number) {
  const world = Object.keys(tiles).find(name => new RegExp(`/worlds/${name}/tiles/atlas\\.(png|webp)$`).test(src));
  let rect: Rect | undefined;
  let size: readonly [number, number] = [1536,1024];
  if (world) { const sheet = tiles[world]; rect = sheet.cells[row*4+column]; size = sheet.size; }
  if (/\/meadow\/gameplay\/meadow_gameplay_atlas\.(png|webp)$/.test(src) && row === 0) {
    rect = ([[45,150,245,350],[335,135,260,370],[620,300,335,195],[995,230,210,230],[1260,220,240,240]] as const)[column];
  }
  if (!rect) return null;
  return { x: Math.round(rect[0]*width/size[0]), y: Math.round(rect[1]*height/size[1]),
    width: Math.round(rect[2]*width/size[0]), height: Math.round(rect[3]*height/size[1]) };
}
