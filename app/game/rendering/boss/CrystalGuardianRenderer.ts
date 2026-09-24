import type { CrystalGuardianBoss } from "../../bosses/CrystalGuardianBoss";
import { FLOOR } from "../../levels";
import { atlasBounds } from "../atlasBounds";

export function renderCrystalGuardian(ctx: CanvasRenderingContext2D, boss: CrystalGuardianBoss,
  tick: number, image: CanvasImageSource | null) {
  const cx = boss.x + boss.width / 2;
  const pulse = .5 + .5 * Math.sin(tick * .22);
  ctx.save();

  // Each attack announces its danger zone before becoming harmful.
  if (boss.phase === "warningDash") {
    ctx.fillStyle = `rgba(76,235,255,${.13 + pulse * .22})`;
    ctx.fillRect(4430, FLOOR - 27, 930, 26);
    ctx.strokeStyle = "#adfaff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(4430, FLOOR - 28); ctx.lineTo(5360, FLOOR - 28); ctx.stroke();
  }
  if (boss.phase === "warningSlam" || boss.phase === "leap") {
    ctx.strokeStyle = `rgba(121,247,255,${.48 + pulse * .48})`;
    ctx.fillStyle = `rgba(78,218,255,${.11 + pulse * .17})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(boss.targetX + boss.width / 2, FLOOR - 6, 112, 17, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      const x = boss.targetX + boss.width / 2 + side * 77;
      ctx.beginPath(); ctx.moveTo(x, FLOOR - 25); ctx.lineTo(x + side * 18, FLOOR - 5); ctx.stroke();
    }
  }
  if (boss.phase === "warningBolts" || boss.phase === "barrage") {
    ctx.strokeStyle = `rgba(106,235,255,${.4 + pulse * .5})`;
    ctx.lineWidth = 4;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath(); ctx.arc(cx, boss.y + 62, 38 + ring * 15 + pulse * 5, 0, Math.PI * 2); ctx.stroke();
    }
  }
  if (boss.phase === "warningWaves") {
    ctx.fillStyle = `rgba(100,231,255,${.18 + pulse * .22})`;
    ctx.fillRect(4430, FLOOR - 18, 930, 18);
    ctx.strokeStyle = "#b2faff"; ctx.lineWidth = 3;
    for (let x = 4450; x < 5350; x += 54) {
      ctx.beginPath(); ctx.moveTo(x, FLOOR - 21); ctx.lineTo(x + 18, FLOOR - 34); ctx.lineTo(x + 36, FLOOR - 21); ctx.stroke();
    }
  }
  if (boss.phase === "impact") {
    ctx.strokeStyle = `rgba(177,250,255,${.75 - (19 - boss.timer) / 36})`;
    ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(cx, FLOOR - 7, 92 + (19 - boss.timer) * 9, 12, 0, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.fillStyle = "rgba(28,38,85,.35)";
  ctx.beginPath(); ctx.ellipse(cx, FLOOR + 2, boss.phase === "leap" ? 52 : 95, 9, 0, 0, Math.PI * 2); ctx.fill();
  if (boss.phase === "exposed") {
    ctx.fillStyle = `rgba(255,224,97,${.19 + pulse * .2})`;
    ctx.beginPath(); ctx.ellipse(cx, boss.y + 76, 126, 92, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.save();
  if (boss.invulnerable > 0 && tick % 6 < 3) ctx.globalAlpha = .6;
  const bob = boss.phase === "leap" || boss.phase === "impact" ? 0 : Math.sin(tick * .09) * 4;
  ctx.translate(cx, boss.y + boss.height + bob);
  ctx.scale(boss.facing === -1 ? 1 : -1, 1);
  if (boss.phase === "dash") { ctx.rotate(-.12); ctx.scale(1.12, .94); }
  else if (boss.phase === "impact") ctx.scale(1.14, .84);
  else if (boss.phase === "stagger") ctx.rotate(Math.sin(tick * .55) * .08);
  else if (boss.phase === "barrage") ctx.rotate(Math.sin(tick * .18) * .035);
  if (image) {
    const source = atlasBounds(image, 1, 1, 0, 0);
    ctx.drawImage(image, source.x, source.y, source.width, source.height, -153, -212, 306, 212);
  } else {
    ctx.fillStyle = "#e8f6ed"; ctx.strokeStyle = "#51c9e9"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-96, -159, 192, 150, 32); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#44d9fa"; ctx.beginPath(); ctx.arc(0, -90, 29, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  for (const shot of boss.bolts) {
    ctx.save(); ctx.shadowColor = "#78eaff"; ctx.shadowBlur = 18;
    ctx.strokeStyle = "rgba(134,245,255,.5)"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(shot.x - shot.vx * 2.5, shot.y - shot.vy * 2.5); ctx.lineTo(shot.x, shot.y); ctx.stroke();
    ctx.fillStyle = "#e5ffff"; ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const wave of boss.waves) {
    ctx.save(); ctx.shadowColor = "#40d9ff"; ctx.shadowBlur = 15;
    const gradient = ctx.createLinearGradient(wave.x, FLOOR - 40, wave.x, FLOOR);
    gradient.addColorStop(0, "#efffff"); gradient.addColorStop(1, "#2596d6");
    ctx.fillStyle = gradient;
    for (let spike = 0; spike < 3; spike++) {
      const x = wave.x + spike * wave.width / 3;
      ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 8, FLOOR - 39 - (spike % 2) * 8);
      ctx.lineTo(x + wave.width / 3, FLOOR); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}
