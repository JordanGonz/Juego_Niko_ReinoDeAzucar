import { FLOOR } from "../../levels";
import type { Biome } from "../../types";

type GoalView = { x: number; biome: Biome; tick: number; locked: boolean; finishing: boolean; finalWorld: boolean };

const PALETTES: Record<Biome, { stone: string; edge: string; light: string; deep: string }> = {
  meadow: { stone: "#fff0c5", edge: "#edaa65", light: "#ffe078", deep: "#ff5fa1" },
  canyon: { stone: "#554054", edge: "#ff9450", light: "#ffe26e", deep: "#e7433b" },
  cave: { stone: "#63538e", edge: "#b590eb", light: "#8df8ff", deep: "#9454d6" },
  crystal: { stone: "#eef5ef", edge: "#a6cde1", light: "#e5fff5", deep: "#63a8ff" },
};

function arch(ctx: CanvasRenderingContext2D, cx: number, top: number, halfWidth: number) {
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, FLOOR - 11);
  ctx.lineTo(cx - halfWidth, top + 48);
  ctx.bezierCurveTo(cx - halfWidth, top - 15, cx + halfWidth, top - 15, cx + halfWidth, top + 48);
  ctx.lineTo(cx + halfWidth, FLOOR - 11);
  ctx.closePath();
}

export class GoalRenderer {
  render(ctx: CanvasRenderingContext2D, view: GoalView) {
    const { x, biome, tick, locked, finishing, finalWorld } = view;
    const colors = PALETTES[biome];
    const cx = x + 12;
    const top = FLOOR - 150;
    const pulse = .5 + .5 * Math.sin(tick * .09);
    ctx.save();

    // Portal interior sits behind the frame and the player.
    arch(ctx, cx, top + 11, 35);
    ctx.save();
    ctx.clip();
    const inside = ctx.createLinearGradient(cx - 36, top, cx + 45, FLOOR);
    inside.addColorStop(0, locked ? "#211c35" : colors.deep);
    inside.addColorStop(.55, locked ? "#383043" : colors.light);
    inside.addColorStop(1, locked ? "#19162f" : colors.deep);
    ctx.fillStyle = inside;
    ctx.fillRect(cx - 40, top, 80, FLOOR - top);
    if (!locked) {
      ctx.globalAlpha = .28 + pulse * .16;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 5; i++) {
        const rise = (tick * (1 + i % 2) + i * 37) % 150;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(i * 4 + tick * .035) * 23, FLOOR - rise, 12 + i * 2, 24, .3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.shadowColor = locked ? "transparent" : colors.light;
    ctx.shadowBlur = locked ? 0 : 12 + pulse * 14 + (finishing ? 12 : 0);
    arch(ctx, cx, top, 43);
    ctx.lineWidth = 13;
    ctx.strokeStyle = colors.stone;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = colors.edge;
    ctx.stroke();

    // Two carved columns and a threshold connect the art to the actual floor.
    ctx.fillStyle = colors.stone;
    ctx.fillRect(cx - 51, top + 48, 14, FLOOR - top - 48);
    ctx.fillRect(cx + 37, top + 48, 14, FLOOR - top - 48);
    ctx.fillStyle = colors.edge;
    ctx.fillRect(cx - 51, top + 48, 3, FLOOR - top - 48);
    ctx.fillRect(cx + 48, top + 48, 3, FLOOR - top - 48);
    ctx.fillStyle = colors.stone;
    ctx.beginPath();
    ctx.roundRect(cx - 60, FLOOR - 12, 120, 12, 5);
    ctx.fill();
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crown and hovering star identify the exit at a glance.
    ctx.save();
    ctx.translate(cx, top + 8);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = locked ? colors.edge : colors.light;
    ctx.shadowColor = colors.light;
    ctx.shadowBlur = locked ? 0 : 15;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.restore();
    if (!locked) {
      for (let i = 0; i < 5; i++) {
        const side = i % 2 ? -1 : 1;
        const sx = cx + side * (58 + i * 5);
        const sy = top + 22 + i * 25 + Math.sin(tick * .06 + i) * 4;
        ctx.globalAlpha = .42 + pulse * .35;
        ctx.fillStyle = colors.light;
        ctx.beginPath();
        ctx.arc(sx, sy, i % 3 === 0 ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#bcb5c6";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("◆", cx, FLOOR - 54);
    }

    const label = locked ? "JEFE PENDIENTE" : finalWorld ? "CASTILLO" : "SALIDA";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    const labelWidth = locked ? 128 : 80;
    ctx.fillStyle = "rgba(31,19,53,.85)";
    ctx.beginPath();
    ctx.roundRect(cx - labelWidth / 2, top - 28, labelWidth, 23, 8);
    ctx.fill();
    ctx.fillStyle = locked ? "#f7cba8" : "#fff8d2";
    ctx.fillText(label, cx, top - 12);
    ctx.restore();
  }
}
