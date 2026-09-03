import type {
  EnemyRenderer,
  EnemyRenderContext,
} from "./EnemyRenderer.ts";

export class SpriteEnemyRenderer implements EnemyRenderer {
  constructor(
    private readonly image: CanvasImageSource,
    private readonly frameWidth: number,
    private readonly frameHeight: number,
    private readonly frameInset = 1,
  ) {}

  render({ ctx, enemy }: EnemyRenderContext) {
    const visual = enemy.visualBounds;

    const sourceX =
      enemy.animationFrame * this.frameWidth +
      this.frameInset;

    const sourceY = this.frameInset;

    const sourceWidth = Math.max(
      1,
      this.frameWidth - this.frameInset * 2,
    );

    const sourceHeight = Math.max(
      1,
      this.frameHeight - this.frameInset * 2,
    );

    ctx.save();

    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = enemy.opacity;

    ctx.translate(
      enemy.x +
        visual.offsetX +
        visual.width / 2,
      enemy.y + visual.offsetY,
    );

    ctx.scale(enemy.facing, 1);

    ctx.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -visual.width / 2,
      0,
      visual.width,
      visual.height,
    );

    ctx.restore();
  }
}