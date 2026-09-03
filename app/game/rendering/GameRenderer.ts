import { FLOOR, LEVELS } from "../levels";
import { collisionRect, visualRect } from "../entities/Player";
import { projectileCollisionRect } from "../entities/Projectile";
import { getEnemyDebugData } from "../enemies/debug";
import { PlaceholderPlayerRenderer } from "./player/PlaceholderPlayerRenderer";
import type { PlayerRenderer } from "./player/PlayerRenderer";
import { EnemyRendererFactory } from "./enemy/EnemyRendererFactory";
import { ProjectileRenderer } from "./enemy/ProjectileRenderer";
import type { Biome, RenderState } from "../types";

const PLATFORM_PALETTE: Record<Biome, readonly [string, string, string, string]> = {
  meadow: ["#65e080", "#32bd68", "#9c5a42", "#60384a"],
  canyon: ["#ffd35a", "#f29b38", "#bc4f48", "#702e4d"],
  cave: ["#f08c9d", "#ba4c79", "#6a3153", "#351d3f"],
  crystal: ["#b9fff4", "#55d8df", "#5262bd", "#29265f"],
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

export class GameRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly playerRenderer: PlayerRenderer = new PlaceholderPlayerRenderer();
  private readonly enemyRenderers = new EnemyRendererFactory();
  private readonly projectileRenderer = new ProjectileRenderer();
  private logicalWidth = 960;
  private readonly logicalHeight = 540;
  private pixelRatio = 1;

  get viewportWidth() { return this.logicalWidth; }

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D no está disponible");
    this.ctx = context;
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const isPortrait = window.innerWidth <= 760 && window.innerHeight > window.innerWidth;
    this.logicalWidth = isPortrait
      ? Math.max(320, Math.round(540 * (bounds.width / Math.max(bounds.height, 1))))
      : 960;
    this.pixelRatio = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.logicalWidth * this.pixelRatio);
    this.canvas.height = Math.round(this.logicalHeight * this.pixelRatio);
  }

  render(view: RenderState) {
    const { ctx } = this;
    const { level, cameraX, tick } = view;
    const width = this.logicalWidth;
    const height = this.logicalHeight;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, level.sky[0]); sky.addColorStop(0.48, level.sky[1]); sky.addColorStop(1, level.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);

    this.drawBiome(view);

    const palette = PLATFORM_PALETTE[level.biome];
    ctx.save(); ctx.translate(-cameraX, 0);
    level.platforms.forEach(([x, y, platformWidth, platformHeight]) => {
      const gradient = ctx.createLinearGradient(0, y, 0, y + platformHeight);
      gradient.addColorStop(0, palette[0]); gradient.addColorStop(0.16, palette[1]);
      gradient.addColorStop(0.17, palette[2]); gradient.addColorStop(1, palette[3]);
      ctx.fillStyle = gradient; roundRect(ctx, x, y, platformWidth, platformHeight, 14); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.28)";
      for (let px = x + 25; px < x + platformWidth - 10; px += 55) {
        ctx.beginPath(); ctx.arc(px, y + 10, 4, 0, Math.PI * 2); ctx.fill();
      }
    });

    view.coins.forEach((coin, index) => {
      if (coin.taken) return;
      const pulse = 1 + Math.sin(tick * 0.12 + index) * 0.09;
      ctx.save(); ctx.translate(coin.x, coin.y); ctx.scale(pulse, 1);
      ctx.shadowColor = "#fff6a0"; ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff3a5"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#f39c12"; ctx.fillRect(-2, -7, 4, 14); ctx.restore();
    });

    view.pickups.forEach((pickup, index) => {
      if (pickup.taken) return;
      const bob = Math.sin(tick * 0.09 + index) * 5;
      ctx.save(); ctx.translate(pickup.x, pickup.y + bob);
      ctx.shadowColor = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(36,16,71,.78)"; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 23px Arial";
      ctx.fillStyle = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
      ctx.fillText(pickup.type === "heart" ? "♥" : pickup.type === "shield" ? "◆" : "⚡", 0, 1);
      ctx.restore();
    });

    view.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      this.enemyRenderers.get(enemy.type).render({ ctx, enemy, tick });
    });
    view.projectiles.forEach((projectile) => this.projectileRenderer.render(ctx, projectile));

    const goalX = level.width - 150;
    ctx.fillStyle = "#ffda3d"; ctx.fillRect(goalX, 235, 14, 223);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(goalX + 7, 226, 18, 0, Math.PI * 2); ctx.fill();
    const flagWave = Math.sin(tick * 0.2) * (view.state === "finishing" ? 11 : 4);
    ctx.fillStyle = "#ff4e88"; ctx.beginPath(); ctx.moveTo(goalX + 14, 255);
    ctx.quadraticCurveTo(goalX + 62, 273 + flagWave, goalX + 110, 287);
    ctx.quadraticCurveTo(goalX + 62, 304 + flagWave, goalX + 14, 318); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "900 19px Arial";
    ctx.fillText(view.activeLevel === LEVELS.length - 1 ? "TORRE" : "META", goalX + 35, 293);

    view.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / 45); ctx.fillStyle = particle.color;
      const size = particle.size ?? 8;
      ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
    this.playerRenderer.render({ ctx, player: view.player, frame: view.animationFrame, tick, power: view.activePower });
    ctx.restore();

    if (view.state === "finishing") this.drawFinish(view);

    const vignette = ctx.createRadialGradient(width / 2, height / 2, 190, width / 2, height / 2, 650);
    vignette.addColorStop(0.55, "rgba(26,12,58,0)"); vignette.addColorStop(1, "rgba(26,12,58,.34)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);

    if (view.debug) this.drawDebug(view);
  }

  private drawBiome(view: RenderState) {
    const { ctx } = this;
    const { level, cameraX, tick } = view;
    const width = this.logicalWidth;
    if (level.biome === "meadow") {
      ctx.fillStyle = "rgba(255,244,155,.9)"; ctx.beginPath(); ctx.arc(790, 86, 46, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 7; i++) this.drawCloud(((i * 260 - cameraX * 0.12) % 1500) - 120, 90 + (i % 3) * 65, 0.65 + (i % 2) * 0.25);
      ctx.fillStyle = "#9b5de5";
      for (let i = 0; i < 11; i++) {
        const x = i * 330 - (cameraX * 0.22 % 330) - 80;
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x + 140, 150 + (i % 3) * 40, x + 310, FLOOR); ctx.fill();
      }
      ctx.fillStyle = "#7146c5";
      for (let i = 0; i < 9; i++) {
        const x = i * 420 - (cameraX * 0.38 % 420) - 100;
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x + 180, 235 + (i % 2) * 45, x + 390, FLOOR); ctx.fill();
      }
      ctx.fillStyle = "#4c235f"; ctx.fillRect(0, FLOOR, width, this.logicalHeight - FLOOR);
    } else if (level.biome === "canyon") {
      ctx.fillStyle = "rgba(255,218,88,.9)"; ctx.beginPath(); ctx.arc(760, 120, 78, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#a13e67";
      for (let i = 0; i < 7; i++) {
        const x = i * 260 - (cameraX * 0.18 % 260) - 60;
        const mesaHeight = 110 + (i % 3) * 38;
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 35, FLOOR - mesaHeight); ctx.lineTo(x + 150, FLOOR - mesaHeight); ctx.lineTo(x + 210, FLOOR); ctx.fill();
      }
      ctx.fillStyle = "#ff6b35"; ctx.fillRect(0, FLOOR, width, this.logicalHeight - FLOOR);
      ctx.strokeStyle = "#ffd35a"; ctx.lineWidth = 5;
      for (let x = -20; x < width + 40; x += 60) { ctx.beginPath(); ctx.arc(x, FLOOR + 16 + Math.sin((tick + x) * 0.05) * 5, 26, Math.PI, 0); ctx.stroke(); }
    } else if (level.biome === "cave") {
      ctx.fillStyle = "#24143d";
      for (let x = -40; x < width + 80; x += 95) {
        const depth = 70 + ((x + 120) % 4) * 22;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 38, depth); ctx.lineTo(x + 76, 0); ctx.fill();
      }
      for (let i = 0; i < 18; i++) {
        const x = (i * 137 - cameraX * 0.08) % (width + 100);
        ctx.fillStyle = i % 2 ? "rgba(255,126,179,.55)" : "rgba(91,236,218,.55)";
        ctx.beginPath(); ctx.arc(x, 110 + (i * 73) % 250, 3 + (i % 3), 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#5a2735"; ctx.fillRect(0, FLOOR, width, this.logicalHeight - FLOOR);
      ctx.fillStyle = "#bb5b4c";
      for (let x = 0; x < width; x += 55) { ctx.beginPath(); ctx.arc(x, FLOOR + 10 + Math.sin((tick + x) * 0.06) * 4, 22, Math.PI, 0); ctx.fill(); }
    } else {
      for (let i = 0; i < 36; i++) {
        ctx.fillStyle = i % 3 ? "rgba(255,255,255,.65)" : "rgba(117,247,231,.8)";
        ctx.fillRect((i * 113 - cameraX * 0.04) % (width + 30), 25 + (i * 67) % 300, 2 + (i % 2), 2 + (i % 2));
      }
      const aurora = ctx.createLinearGradient(0, 80, width, 330);
      aurora.addColorStop(0, "rgba(70,255,221,0)"); aurora.addColorStop(0.45, "rgba(70,255,221,.22)"); aurora.addColorStop(1, "rgba(255,91,205,0)");
      ctx.fillStyle = aurora; ctx.fillRect(0, 70, width, 260);
      ctx.fillStyle = "#342a83";
      for (let i = 0; i < 9; i++) {
        const x = i * 145 - (cameraX * 0.25 % 145);
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 65, 190 + (i % 3) * 35); ctx.lineTo(x + 130, FLOOR); ctx.fill();
      }
      ctx.fillStyle = "#17275f"; ctx.fillRect(0, FLOOR, width, this.logicalHeight - FLOOR);
    }
  }

  private drawCloud(x: number, y: number, scale: number) {
    const { ctx } = this;
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.beginPath(); ctx.arc(x, y, 24 * scale, 0, Math.PI * 2); ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 62 * scale, y, 24 * scale, 0, Math.PI * 2); ctx.fill();
  }

  private drawFinish(view: RenderState) {
    const { ctx } = this;
    const reveal = Math.min(1, view.finishTimer / 18);
    const lift = Math.sin(Math.min(1, view.finishTimer / 40) * Math.PI) * 12;
    ctx.save(); ctx.globalAlpha = reveal; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(36,16,71,.45)"; ctx.shadowBlur = 18;
    ctx.fillStyle = "#fff"; ctx.font = "1000 58px Arial"; ctx.fillText("¡META!", this.logicalWidth / 2, 130 - lift);
    ctx.fillStyle = "#ffe047"; ctx.font = "900 18px Arial";
    ctx.fillText(`CAPÍTULO ${view.activeLevel + 1} COMPLETADO`, this.logicalWidth / 2, 163 - lift);
    ctx.restore();
  }

  private drawDebug(view: RenderState) {
    const { ctx } = this;
    ctx.save(); ctx.translate(-view.cameraX, 0);
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,0,.75)";
    view.level.platforms.forEach(([x, y, width, height]) => ctx.strokeRect(x, y, width, height));
    const collision = collisionRect(view.player);
    const visual = visualRect(view.player);
    ctx.strokeStyle = "rgba(0,255,255,.95)";
    ctx.strokeRect(collision.x, collision.y, collision.width, collision.height);
    ctx.strokeStyle = "rgba(80,255,120,.9)";
    ctx.strokeRect(visual.x, visual.y, visual.width, visual.height);
    view.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const data = getEnemyDebugData(enemy);
      ctx.strokeStyle = "rgba(255,70,90,.95)";
      ctx.strokeRect(data.collision.x, data.collision.y, data.collision.width, data.collision.height);
      ctx.strokeStyle = "rgba(255,150,230,.8)";
      ctx.strokeRect(data.visual.x, data.visual.y, data.visual.width, data.visual.height);
      ctx.strokeStyle = "rgba(255,210,50,.55)";
      ctx.strokeRect(data.patrol[0], enemy.platformY - 3, data.patrol[1] - data.patrol[0], 6);
      ctx.fillStyle = "rgba(10,8,30,.86)"; ctx.fillRect(data.visual.x, data.visual.y - 30, 215, 27);
      ctx.fillStyle = "#fff"; ctx.font = "11px monospace";
      ctx.fillText(`${data.type} ${data.state} hp:${data.health} f:${data.facing} t:${data.timer}`, data.visual.x + 3, data.visual.y - 25);
      ctx.fillText(`detect:${data.detectionRange} x:${enemy.x.toFixed(0)}`, data.visual.x + 3, data.visual.y - 13);
    });
    ctx.strokeStyle = "rgba(255,155,30,.95)";
    view.projectiles.forEach((projectile) => {
      const rect = projectileCollisionRect(projectile); ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
    ctx.restore();

    ctx.save(); ctx.fillStyle = "rgba(10,8,30,.82)"; ctx.fillRect(10, 10, 315, 214);
    ctx.fillStyle = "#fff"; ctx.font = "14px monospace"; ctx.textBaseline = "top";
    const lines = [
      `FPS ${view.fps.toFixed(0)}`,
      `fixed update ${view.fixedUpdateRate} Hz`,
      `player ${view.player.x.toFixed(1)}, ${view.player.y.toFixed(1)}`,
      `vx ${view.player.vx.toFixed(2)}  vy ${view.player.vy.toFixed(2)}`,
      `grounded ${view.player.grounded}`,
      `state ${view.player.state}`,
      `animation ${view.player.animationState} #${view.animationFrame}`,
      `coyote ${view.player.coyoteTimer.toFixed(3)}s`,
      `jump buffer ${view.player.jumpBufferTimer.toFixed(3)}s`,
      `camera ${view.cameraX.toFixed(1)}`,
      `facing ${view.player.facing}`,
      "cyan=player red=enemy orange=projectile",
      "F2: ocultar debug",
    ];
    lines.forEach((line, index) => ctx.fillText(line, 20, 18 + index * 17));
    ctx.restore();
  }
}
