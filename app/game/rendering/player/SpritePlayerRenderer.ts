import { atlasBounds } from "../atlasBounds.ts";
import { visualRect } from "../../entities/Player";
import type {
  PlayerRenderArgs,
  PlayerRenderer,
} from "./PlayerRenderer";
import { playerVisualTransform } from "./visualTransform";

export type SpriteSheet = {
  image: CanvasImageSource;

  frameWidth: number;
  frameHeight: number;

  columns: number;

  pivotX: number;
  pivotY: number;

  scale: number;
};

export class SpritePlayerRenderer
  implements PlayerRenderer
{
  private readonly inset = 2;

  constructor(
    private readonly sheet: SpriteSheet,
  ) {}

  render({
    ctx,
    player,
    frame,
    tick,
  }: PlayerRenderArgs) {
    const visual = visualRect(player);

    const transform =
      playerVisualTransform(
        player.animationState,
        tick,
      );

    // The supplied sheet has seven poses in the first three rows, eight in the last.
    const row=frame<21?Math.floor(frame/7):3;
    const columns=row===3?8:7;
    const column=row===3?Math.min(7,frame-21):frame%7;
    const source=atlasBounds(this.sheet.image,columns,4,column,row);
    const scale=Math.min(visual.width/source.width,visual.height/source.height);
    const drawWidth=source.width*scale,drawHeight=source.height*scale;
    const sourceX=source.x,sourceY=source.y,sourceWidth=source.width,sourceHeight=source.height;
    const anchorX=player.x+player.collisionBounds.width/2;
    const anchorY=player.y+player.collisionBounds.height+transform.offsetY;
    const drawX=-drawWidth/2,drawY=-drawHeight;
    ctx.save();
    if(player.inv>0)ctx.globalAlpha=tick%8<4?.45:1;

    ctx.imageSmoothingEnabled = true;

    ctx.translate(
      Math.round(anchorX),
      Math.round(anchorY),
    );

    ctx.scale(
      player.facing *
        transform.scaleX,
      transform.scaleY,
    );

    ctx.drawImage(
      this.sheet.image,

      Math.round(sourceX),
      Math.round(sourceY),
      Math.round(sourceWidth),
      Math.round(sourceHeight),

      Math.round(drawX),
      Math.round(drawY),

      Math.round(drawWidth),
      Math.round(drawHeight),
    );

    ctx.restore();
  }
}
