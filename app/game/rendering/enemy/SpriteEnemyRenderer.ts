import { atlasBounds } from "../atlasBounds.ts";
import { isolatedAtlasFrame } from "../isolatedAtlasFrame";
import type {
  EnemyRenderer,
  EnemyRenderContext,
} from "./EnemyRenderer.ts";

export class SpriteEnemyRenderer implements EnemyRenderer {
  private readonly isolatedFrames = new Map<number, HTMLCanvasElement>();
  constructor(
    private readonly image: CanvasImageSource,
    private readonly frameWidth: number,
    private readonly frameHeight: number,
    private readonly frameInset = 1,
  ) {}

  render({ ctx, enemy, tick }: EnemyRenderContext) {
    const visual = enemy.visualBounds;

    const state=enemy.animationState;
    const bandit = enemy.type === "maskedBandit";
    const frames=state==="defeated"?[5]:state==="anticipate"||state==="alert"?[2]:state==="recover"||state==="land"||state==="hurt"?[4]:state==="attack"?(bandit?[0,1]:[3]):state==="airborne"?[2,3]:state==="phase"?[2]:[0,1];
    const frame=frames[enemy.animationFrame%frames.length];
    const isolated = bandit ? this.getIsolatedFrame(frame) : null;
    const source = isolated ? null : atlasBounds(this.image,6,1,frame,0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = enemy.opacity;
    if (state === "anticipate" || state === "alert") {
      const glow = .45 + Math.sin(tick * .24) * .25;
      ctx.strokeStyle = `rgba(255,226,96,${glow})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(enemy.x + enemy.collisionBounds.width / 2, enemy.platformY - 2, 23, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffdf68";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("!", enemy.x + enemy.collisionBounds.width / 2, enemy.y + visual.offsetY - 6);
    }
    if (state === "attack") {
      ctx.strokeStyle = "rgba(255,170,96,.55)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const sx = enemy.x - enemy.facing * (10 + i * 8);
        const sy = enemy.y + visual.offsetY + visual.height * (.55 + i * .1);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - enemy.facing * (10 - i * 2), sy); ctx.stroke();
      }
    }
    ctx.translate(
      enemy.x +
        visual.offsetX +
        visual.width / 2,
      enemy.y + visual.offsetY + (enemy.type === "roundBat" || enemy.type === "stealthGhost" ? Math.sin(tick * .12 + enemy.x) * 2 : 0),
    );
    ctx.scale(enemy.facing, 1);
    if (state === "attack") ctx.rotate(-.08);
    if (state === "hurt") ctx.filter = "brightness(1.8) saturate(1.5)";

    if (isolated) ctx.drawImage(isolated, -visual.width / 2, 0, visual.width, visual.height);
    else if (source) ctx.drawImage(this.image, source.x, source.y, source.width, source.height,
      -visual.width / 2, 0, visual.width, visual.height);

    ctx.restore();
  }

  private getIsolatedFrame(frame: number) {
    const cached = this.isolatedFrames.get(frame);
    if (cached) return cached;
    const isolated = isolatedAtlasFrame(this.image, 6, 1, frame, 0);
    this.isolatedFrames.set(frame, isolated);
    return isolated;
  }
}
