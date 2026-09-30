export function renderRegionExit(ctx: CanvasRenderingContext2D, x: number, name: string, direction: -1 | 1, locked: boolean, tick: number) {
  ctx.save();
  ctx.translate(x, 0);
  const side = direction === 1 ? -1 : 1;
  ctx.fillStyle = "rgba(34,19,58,.82)";
  ctx.fillRect(side * 104 - (direction === 1 ? 0 : 104), 368, 104, 28);
  ctx.strokeStyle = locked ? "#ff8567" : "#ffe080";
  ctx.lineWidth = 2;
  ctx.strokeRect(side * 104 - (direction === 1 ? 0 : 104), 368, 104, 28);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5db";
  ctx.font = "bold 11px Arial";
  const boardCenter = direction === 1 ? -52 : 52;
  ctx.fillText(locked ? "DERROTA AL JEFE" : `${direction === 1 ? "→" : "←"} ${name}`, boardCenter, 386, 96);
  if (locked) {
    ctx.fillStyle = `rgba(255,79,79,${.25 + Math.sin(tick * .1) * .08})`;
    ctx.fillRect(-9, 0, 18, 458);
    ctx.strokeStyle = "rgba(255,220,145,.85)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 458); ctx.stroke();
  }
  ctx.restore();
}

export function renderBranchHint(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.save();
  ctx.fillStyle = "rgba(34,19,58,.85)";
  ctx.fillRect(x - 61, y - 25, 122, 25);
  ctx.strokeStyle = "#86f4e3";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 61, y - 25, 122, 25);
  ctx.fillStyle = "#fff8d9";
  ctx.textAlign = "center";
  ctx.font = "bold 11px Arial";
  ctx.fillText(label, x, y - 8);
  ctx.restore();
}
