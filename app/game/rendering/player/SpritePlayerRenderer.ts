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

    const column =
      frame % this.sheet.columns;

    const row =
      Math.floor(
        frame / this.sheet.columns,
      );

    const sourceX =
      column *
        this.sheet.frameWidth +
      this.inset;

    const sourceY =
      row *
        this.sheet.frameHeight +
      this.inset;

    const sourceWidth =
      this.sheet.frameWidth -
      this.inset * 2;

    const sourceHeight =
      this.sheet.frameHeight -
      this.inset * 2;

    const drawWidth =
      this.sheet.frameWidth *
      this.sheet.scale;

    const drawHeight =
      this.sheet.frameHeight *
      this.sheet.scale;

    const anchorX =
      visual.x +
      visual.width / 2;

    const anchorY =
      visual.y +
      visual.height +
      transform.offsetY;

    const drawX =
      -this.sheet.pivotX *
      this.sheet.scale;

    const drawY =
      -this.sheet.pivotY *
      this.sheet.scale;

    ctx.save();

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