import { visualRect } from "../../entities/Player";
import type {
  PlayerRenderArgs,
  PlayerRenderer,
} from "./PlayerRenderer";
import { playerVisualTransform } from "./visualTransform";
import { isolatedAtlasFrame } from "../isolatedAtlasFrame";

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
  private readonly frames = new Map<number, HTMLCanvasElement>();

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

    // Seven poses in every row. Using eight in the final row sampled the next pose.
    const row=Math.min(3,Math.floor(frame/7));
    const columns=7;
    const column=frame%7;
    const sprite=this.getFrame(frame,columns,column,row);
    const scale=Math.min(visual.width/sprite.width,visual.height/sprite.height);
    const drawWidth=sprite.width*scale,drawHeight=sprite.height*scale;
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
      sprite,
      Math.round(drawX),
      Math.round(drawY),

      Math.round(drawWidth),
      Math.round(drawHeight),
    );

    ctx.restore();
  }

  private getFrame(frame: number, columns: number, column: number, row: number): HTMLCanvasElement {
    const cached = this.frames.get(frame);
    if (cached) return cached;
    const canvas = isolatedAtlasFrame(this.sheet.image, columns, 4, column, row);
    this.frames.set(frame, canvas);
    return canvas;
  }
}
