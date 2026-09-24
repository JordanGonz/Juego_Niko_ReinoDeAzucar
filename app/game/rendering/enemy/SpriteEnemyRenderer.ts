import { atlasBounds } from "../atlasBounds.ts";
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

    const state=enemy.animationState;
    const frames=state==="defeated"?[5]:state==="anticipate"||state==="alert"?[2]:state==="recover"||state==="land"||state==="hurt"?[4]:state==="attack"?[3]:state==="airborne"?[2,3]:state==="phase"?[2]:[0,1];
    const frame=frames[enemy.animationFrame%frames.length];
    const source=atlasBounds(this.image,6,1,frame,0);
    const sourceX=source.x,sourceY=source.y,sourceWidth=source.width,sourceHeight=source.height;
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
