import type { EnemyRenderer, EnemyRenderContext } from "./EnemyRenderer.ts";

export class SpriteEnemyRenderer implements EnemyRenderer {
  constructor(private readonly image: CanvasImageSource, private readonly frameWidth: number, private readonly frameHeight: number) {}
  render({ ctx, enemy }: EnemyRenderContext) {
    const visual = enemy.visualBounds;
    ctx.save();
    ctx.globalAlpha = enemy.opacity;
    ctx.translate(enemy.x + visual.offsetX + visual.width / 2, enemy.y + visual.offsetY);
    ctx.scale(enemy.facing, 1);
    ctx.drawImage(this.image, enemy.animationFrame * this.frameWidth, 0, this.frameWidth, this.frameHeight, -visual.width / 2, 0, visual.width, visual.height);
    ctx.restore();
  }
}
