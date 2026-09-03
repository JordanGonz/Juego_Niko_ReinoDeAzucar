import { LEVELS } from "../levels";
import { collisionRect, visualRect } from "../entities/Player";
import { projectileCollisionRect } from "../entities/Projectile";
import { getEnemyDebugData } from "../enemies/debug";
import { PlaceholderPlayerRenderer } from "./player/PlaceholderPlayerRenderer";
import type { PlayerRenderer } from "./player/PlayerRenderer";
import { EnemyRendererFactory } from "./enemy/EnemyRendererFactory";
import { ProjectileRenderer } from "./enemy/ProjectileRenderer";
import { WorldRenderer } from "./world/WorldRenderer";
import { MEADOW_BIOME } from "./world/biomes/meadow";
import type { RenderState } from "../types";

export class GameRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly playerRenderer: PlayerRenderer = new PlaceholderPlayerRenderer();
  private readonly enemyRenderers = new EnemyRendererFactory();
  private readonly projectileRenderer = new ProjectileRenderer();
  private readonly worldRenderer = new WorldRenderer();
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
    const world=this.worldRenderer.get(view);
    const worldContext=this.worldRenderer.context(ctx,view,width,height);
    world.renderBackground(worldContext);
    ctx.save(); ctx.translate(-cameraX, 0);
    world.renderPlatforms(worldContext);
    world.renderGameplay(worldContext);

    view.coins.forEach((coin, index) => {
      if (coin.taken) return;
      const pulse = 1 + Math.sin(tick * 0.12 + index) * 0.09;
      const turn=.58+.42*Math.abs(Math.cos(tick*.055+index));
      ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#392b50";ctx.beginPath();ctx.ellipse(coin.x,coin.y+19,13,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save(); ctx.translate(coin.x, coin.y); ctx.scale(turn,pulse);
      ctx.shadowColor = "#fff6a0"; ctx.shadowBlur = 20;
      ctx.fillStyle="#ffd43b";
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle="rgba(255,246,160,.72)";ctx.beginPath();ctx.ellipse(-4,-5,4,6,-.6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle = "#fff4a8"; ctx.lineWidth = 2.5; ctx.stroke();ctx.strokeStyle="#d98714";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle = "#fff3a5"; ctx.fillRect(-1.5, -6, 3, 12); ctx.restore();
      if((tick+index*13)%48<12){ctx.save();ctx.strokeStyle="rgba(255,255,225,.9)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(coin.x+15,coin.y-12);ctx.lineTo(coin.x+15,coin.y-3);ctx.moveTo(coin.x+11,coin.y-7);ctx.lineTo(coin.x+20,coin.y-7);ctx.stroke();ctx.restore();}
    });

    view.pickups.forEach((pickup, index) => {
      if (pickup.taken) return;
      const bob = Math.sin(tick * 0.09 + index) * 5;
      ctx.save();ctx.globalAlpha=.2;ctx.fillStyle="#352647";ctx.beginPath();ctx.ellipse(pickup.x,pickup.y+25,17,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save(); ctx.translate(pickup.x, pickup.y + bob);
      ctx.shadowColor = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
      ctx.shadowBlur = 22;
      const orb=ctx.createRadialGradient(-6,-7,2,0,0,21);orb.addColorStop(0,"#625287");orb.addColorStop(1,"#251341");ctx.fillStyle=orb;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 24px Arial";
      ctx.fillStyle = pickup.type === "heart" ? "#ff557c" : pickup.type === "shield" ? "#75f7e7" : "#ffe047";
      ctx.fillText(pickup.type === "heart" ? "♥" : pickup.type === "shield" ? "◆" : "⚡", 0, 1);
      ctx.restore();
    });

    ctx.save();ctx.fillStyle="rgba(45,34,57,.24)";
    view.enemies.forEach((enemy)=>{if(!enemy.alive)return;ctx.beginPath();ctx.ellipse(enemy.x+enemy.collisionBounds.width/2,enemy.platformY+3,enemy.visualBounds.width*.36,5,0,0,Math.PI*2);ctx.fill();});
    ctx.beginPath();ctx.ellipse(view.player.x+15,view.player.y+view.player.collisionBounds.height+4,18,5,0,0,Math.PI*2);ctx.fill();ctx.restore();

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
    world.renderForeground(worldContext);
    ctx.restore();

    if (view.state === "finishing") this.drawFinish(view);

    const vignette = ctx.createRadialGradient(width / 2, height / 2, 190, width / 2, height / 2, 650);
    vignette.addColorStop(0.55, "rgba(26,12,58,0)"); vignette.addColorStop(1, level.biome === "meadow" ? "rgba(28,86,76,.18)" : "rgba(26,12,58,.34)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);

    if (view.debug) this.drawDebug(view);
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
    ctx.strokeStyle="rgba(62,255,210,.95)";
    view.checkpoints.forEach((checkpoint)=>ctx.strokeRect(checkpoint.x-12,checkpoint.y,34,58));
    ctx.strokeStyle="rgba(255,235,70,.95)";
    view.hazards.forEach((hazard)=>ctx.strokeRect(hazard.x,hazard.y,hazard.width,hazard.height));
    ctx.restore();

    const biomeRenderer=this.worldRenderer.get(view);
    ctx.save(); ctx.fillStyle = "rgba(10,8,30,.82)"; ctx.fillRect(10, 10, 350, 282);
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
      `biome renderer ${biomeRenderer.id}`,
      `decorations ${(view.level.decorations??[]).length}`,
      `ambient ${view.level.biome==="meadow"?MEADOW_BIOME.ambientParticleCount:0}`,
      `parallax ${MEADOW_BIOME.layers.map((layer)=>layer.speed).join("/")}`,
      `checkpoint ${view.checkpoints.find((item)=>item.activated)?.id??"ninguno"}`,
      "cyan=player red=enemy orange=projectile",
      "F2: ocultar debug",
    ];
    lines.forEach((line, index) => ctx.fillText(line, 20, 18 + index * 17));
    ctx.restore();
  }
}
