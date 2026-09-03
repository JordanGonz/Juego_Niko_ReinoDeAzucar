import { visualRect } from "../../entities/Player";
import type { PlayerRenderArgs, PlayerRenderer } from "./PlayerRenderer";
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

export class SpritePlayerRenderer implements PlayerRenderer {
  constructor(private readonly sheet: SpriteSheet) {}

  render({ ctx, player, frame, tick }: PlayerRenderArgs) {
    const visual = visualRect(player);
    const transform = playerVisualTransform(player.animationState, tick);
    const sourceX = frame % this.sheet.columns * this.sheet.frameWidth;
    const sourceY = Math.floor(frame / this.sheet.columns) * this.sheet.frameHeight;
    const width = this.sheet.frameWidth * this.sheet.scale;
    const height = this.sheet.frameHeight * this.sheet.scale;
    const anchorX = visual.x + visual.width / 2;
    const anchorY = visual.y + visual.height + transform.offsetY;
    ctx.save(); ctx.translate(anchorX, anchorY);
    ctx.scale(player.facing * transform.scaleX, transform.scaleY);
    ctx.drawImage(
      this.sheet.image,
      sourceX, sourceY, this.sheet.frameWidth, this.sheet.frameHeight,
      -this.sheet.pivotX * this.sheet.scale,
      -this.sheet.pivotY * this.sheet.scale,
      width, height,
    );
    ctx.restore();
  }
}
