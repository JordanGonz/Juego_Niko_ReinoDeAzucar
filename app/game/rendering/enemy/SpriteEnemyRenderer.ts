import type {
  EnemyRenderer,
  EnemyRenderContext,
} from "./EnemyRenderer.ts";

export class SpriteEnemyRenderer implements EnemyRenderer {
  constructor(
    private readonly image: CanvasImageSource,
    private readonly frameWidth: number,
    private readonly frameHeight: number,
  ) {}

  render({ ctx, enemy }: EnemyRenderContext) {
    const visual = enemy.visualBounds;

    const drawWidth = visual.width;
    const drawHeight = visual.height;

    const drawX = -drawWidth / 2;
    const drawY = 0;

    const sourceX = enemy.animationFrame * this.frameWidth;

    ctx.save();

    ctx.globalAlpha = enemy.opacity;

    ctx.translate(
      enemy.x + visual.offsetX + visual.width / 2,
      enemy.y + visual.offsetY,
    );

    ctx.scale(enemy.facing, 1);

    ctx.drawImage(
      this.image,
      sourceX,
      0,
      this.frameWidth,
      this.frameHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );

    ctx.restore();
  }
}