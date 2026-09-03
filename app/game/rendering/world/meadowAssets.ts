import type { AssetDefinition } from "../../assets/AssetManager.ts";
import type { DecorationType, PickupType } from "../../types.ts";

export const MEADOW_ASSETS={
  background:{id:"meadow-background",src:"/game/worlds/meadow/background/meadow_far.png"},
  tiles:{id:"meadow-tiles",src:"/game/worlds/meadow/tiles/meadow_tiles_atlas.png"},
  decorations:{id:"meadow-decorations",src:"/game/worlds/meadow/decorations/meadow_decorations_atlas.png"},
  gameplay:{id:"meadow-gameplay",src:"/game/worlds/meadow/gameplay/meadow_gameplay_atlas.png"},
} as const satisfies Record<string,AssetDefinition>;

export const MEADOW_ASSET_MANIFEST=Object.values(MEADOW_ASSETS);
export type AtlasCell=Readonly<{column:number;row:number}>;

export function isVisibleInCamera(x:number,width:number,cameraX:number,viewportWidth:number,padding=140){
  return x+width>=cameraX-padding&&x<=cameraX+viewportWidth+padding;
}

export function meadowBackgroundMode(image:HTMLImageElement|null){return image?"asset":"fallback" as const;}
export function checkpointAtlasCell(active:boolean):AtlasCell{return{column:active?1:0,row:0};}
export function decorationAtlasCell(type:DecorationType,variant=0):AtlasCell{
  const cells:Record<DecorationType,AtlasCell>={
    tree:{column:variant%2,row:0},bush:{column:2,row:0},flowerPatch:{column:3,row:0},
    rock:{column:0,row:1},grass:{column:1,row:1},mushroom:{column:2,row:1},
  };return cells[type];
}
export function pickupAtlasCell(type:PickupType):AtlasCell{
  return type==="heart"?{column:0,row:1}:type==="shield"?{column:1,row:1}:{column:2,row:1};
}

export function drawAtlasCell(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  cell: { column: number; row: number },
  columns: number,
  rows: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  inset = 1,
) {
  const atlas = image as HTMLImageElement;

  const atlasWidth = atlas.naturalWidth || atlas.width;
  const atlasHeight = atlas.naturalHeight || atlas.height;

  const cellWidth = atlasWidth / columns;
  const cellHeight = atlasHeight / rows;

  const sx = cell.column * cellWidth + inset;
  const sy = cell.row * cellHeight + inset;
  const sw = Math.max(1, cellWidth - inset * 2);
  const sh = Math.max(1, cellHeight - inset * 2);

  ctx.drawImage(
    atlas,
    sx,
    sy,
    sw,
    sh,
    Math.round(dx),
    Math.round(dy),
    Math.round(dw),
    Math.round(dh),
  );
}
