import type { RuntimeProjectile } from "../../types";

export class ProjectileRenderer {
  render(ctx:CanvasRenderingContext2D, projectile:RuntimeProjectile) {
    const b=projectile.visualBounds;
    ctx.save();ctx.translate(projectile.x+b.offsetX+b.width/2,projectile.y+b.offsetY+b.height/2);
    ctx.shadowColor="#75f7e7";ctx.shadowBlur=12;ctx.fillStyle="#25305b";
    ctx.beginPath();ctx.arc(0,0,b.width/2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#75f7e7";ctx.lineWidth=3;ctx.stroke();ctx.restore();
  }
}
