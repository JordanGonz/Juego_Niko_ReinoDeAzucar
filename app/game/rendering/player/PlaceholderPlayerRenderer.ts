import { visualRect } from "../../entities/Player";
import type { PlayerRenderArgs, PlayerRenderer } from "./PlayerRenderer";
import { playerVisualTransform } from "./visualTransform";

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
}

export class PlaceholderPlayerRenderer implements PlayerRenderer {
  render({ ctx, player, tick, power }: PlayerRenderArgs) {
    const visual = visualRect(player);
    const transform = playerVisualTransform(player.animationState, tick);
    const anchorX = visual.x + visual.width / 2;
    const anchorY = visual.y + visual.height + transform.offsetY;

    ctx.save();
    if (power === "ESCUDO") {
      ctx.strokeStyle = `rgba(117,247,231,${0.55 + Math.sin(tick * 0.16) * 0.2})`;
      ctx.lineWidth = 4; ctx.beginPath();
      ctx.ellipse(anchorX, visual.y + visual.height / 2, visual.width * 0.7, visual.height * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (player.inv > 0 && Math.floor(player.inv / 4) % 2) ctx.globalAlpha = 0.25;
    ctx.translate(anchorX, anchorY);
    ctx.scale(player.facing * transform.scaleX * (visual.width / 42), transform.scaleY * (visual.height / 50));
    ctx.translate(-21, -50);
    ctx.fillStyle = "#ff315f"; rounded(ctx, -4, 3, 42, 18, 8); ctx.fill();
    ctx.fillStyle = "#21d4c2"; rounded(ctx, 2, 18, 34, 30, 11); ctx.fill();
    ctx.fillStyle = "#ffd9a3"; ctx.beginPath(); ctx.arc(19, 12, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#42205f"; ctx.beginPath(); ctx.arc(19, 6, 18, Math.PI, Math.PI * 2); ctx.lineTo(36, 8); ctx.fill();
    ctx.fillStyle = "#ffe95c"; rounded(ctx, 3, -3, 34, 10, 5); ctx.fill();
    ctx.fillStyle = "#2b1851"; ctx.beginPath(); ctx.arc(24, 12, 2.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6c3ab8"; ctx.fillRect(4, 43, 13, 7); ctx.fillRect(25, 43, 13, 7);
    ctx.restore();
  }
}
