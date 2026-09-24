import {
  LEVELS,
  getGoalX,
} from "../levels";
import { collisionRect, visualRect } from "../entities/Player";
import { projectileCollisionRect } from "../entities/Projectile";
import { getEnemyDebugData } from "../enemies/debug";
import { PlaceholderPlayerRenderer } from "./player/PlaceholderPlayerRenderer";
import type { PlayerRenderer } from "./player/PlayerRenderer";
import { SpritePlayerRenderer } from "./player/SpritePlayerRenderer.ts";
import { SpriteEnemyRenderer } from "./enemy/SpriteEnemyRenderer.ts";
import { EnemyRendererFactory } from "./enemy/EnemyRendererFactory";
import { ProjectileRenderer } from "./enemy/ProjectileRenderer";
import { WorldRenderer } from "./world/WorldRenderer";
import { GoalRenderer } from "./world/GoalRenderer";
import { MEADOW_BIOME } from "./world/biomes/meadow";
import type { RenderState } from "../types";
import { AssetManager } from "../assets/AssetManager.ts";
import { atlasBounds } from "./atlasBounds.ts";
import { CrystalGuardianBoss } from "../bosses/CrystalGuardianBoss";
import { renderCrystalGuardian } from "./boss/CrystalGuardianRenderer";
import { drawAtlasCell, isVisibleInCamera, MEADOW_ASSET_MANIFEST, pickupAtlasCell } from "./world/meadowAssets.ts";
import { ENEMY_ASSET_BY_TYPE, GLOBAL_ASSET_MANIFEST, GLOBAL_ASSETS, worldAssetManifest } from "../assets/gameAssets.ts";
import { canvasPixelRatio } from "./renderQuality.ts";

export class GameRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private playerRenderer: PlayerRenderer = new PlaceholderPlayerRenderer();
  private readonly enemyRenderers = new EnemyRendererFactory();
  private readonly projectileRenderer = new ProjectileRenderer();
  private readonly worldRenderer = new WorldRenderer();
  private readonly goalRenderer = new GoalRenderer();
  private readonly assets = new AssetManager();
  private logicalWidth = 960;
  private readonly logicalHeight = 540;
  private pixelRatio = 1;
  private coarsePointer = false;
  private globalReady = false;
  private readonly requestedBiomes = new Set<string>();

  get viewportWidth() { return this.logicalWidth; }

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D no está disponible");
    this.ctx = context;
    void this.assets.preload([...GLOBAL_ASSET_MANIFEST, ...MEADOW_ASSET_MANIFEST]).then(() => this.configureGlobalSprites()).finally(() => { this.globalReady = true; });
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const isPortrait = window.innerWidth <= 760 && window.innerHeight > window.innerWidth;
    this.logicalWidth = isPortrait
      ? Math.max(320, Math.round(540 * (bounds.width / Math.max(bounds.height, 1))))
      : 960;
    this.coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    this.pixelRatio = canvasPixelRatio(this.logicalWidth, window.devicePixelRatio || 1, this.coarsePointer);
    this.canvas.width = Math.round(this.logicalWidth * this.pixelRatio);
    this.canvas.height = Math.round(this.logicalHeight * this.pixelRatio);
  }

  render(view: RenderState) {
    const { ctx } = this;
    const { level, cameraX, tick } = view;
    const width = this.logicalWidth;
    const height = this.logicalHeight;
    this.ensureBiomeAssets(level.biome);
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = this.coarsePointer ? "medium" : "high";
    const world = this.worldRenderer.get(view);
    const worldContext = this.worldRenderer.context(ctx, view, width, height, this.assets);
    world.renderBackground(worldContext);
    ctx.save(); ctx.translate(-cameraX, 0);
    world.renderPlatforms(worldContext);
    world.renderGameplay(worldContext);

    const gameplayAtlas = this.assets.get(GLOBAL_ASSETS.collectibles.id);
    view.coins.forEach((coin, index) => {
      if (coin.taken || !isVisibleInCamera(coin.x, 30, cameraX, width)) return;

      const pulse = 1 + Math.sin(tick * 0.12 + index) * 0.09;
      const turn = .58 + .42 * Math.abs(Math.cos(tick * .055 + index));

      ctx.save();
      ctx.globalAlpha = .18;
      ctx.fillStyle = "#392b50";
      ctx.beginPath();
      ctx.ellipse(coin.x, coin.y + 14, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.scale(turn, pulse);

      if (gameplayAtlas) {
        drawAtlasCell(
          ctx,
          gameplayAtlas,
          { column: 3, row: 0 },
          5,
          2,
          -16,
          -16,
          32,
          32,
        );
        ctx.restore();
        return;
      }

      ctx.shadowColor = "#fff6a0";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffd43b";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(255,246,160,.72)";
      ctx.beginPath();
      ctx.ellipse(-3, -4, 3, 5, -.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = "#d98714";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#fff3a5";
      ctx.fillRect(-1, -5, 2, 10);

      ctx.restore();

      if ((tick + index * 13) % 48 < 12) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,225,.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(coin.x + 11, coin.y - 9);
        ctx.lineTo(coin.x + 11, coin.y - 3);
        ctx.moveTo(coin.x + 8, coin.y - 6);
        ctx.lineTo(coin.x + 14, coin.y - 6);
        ctx.stroke();
        ctx.restore();
      }
    });

    view.pickups.forEach((pickup, index) => {
      if (pickup.taken || !isVisibleInCamera(pickup.x, 44, cameraX, width)) return;

      const bob = Math.sin(tick * 0.09 + index) * 4;

      ctx.save();
      ctx.globalAlpha = .18;
      ctx.fillStyle = "#352647";
      ctx.beginPath();
      ctx.ellipse(pickup.x, pickup.y + 18, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(pickup.x, pickup.y + bob);

      if (gameplayAtlas) {
        drawAtlasCell(
          ctx,
          gameplayAtlas,
          pickupAtlasCell(pickup.type),
          5,
          2,
          -20,
          -22,
          40,
          44,
        );
        ctx.restore();
        return;
      }

      ctx.shadowColor =
        pickup.type === "heart"
          ? "#ff557c"
          : pickup.type === "shield"
            ? "#75f7e7"
            : "#ffe047";

      ctx.shadowBlur = 18;

      const orb = ctx.createRadialGradient(-5, -6, 2, 0, 0, 16);
      orb.addColorStop(0, "#625287");
      orb.addColorStop(1, "#251341");

      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 20px Arial";

      ctx.fillStyle =
        pickup.type === "heart"
          ? "#ff557c"
          : pickup.type === "shield"
            ? "#75f7e7"
            : "#ffe047";

      ctx.fillText(
        pickup.type === "heart"
          ? "♥"
          : pickup.type === "shield"
            ? "◆"
            : "⚡",
        0,
        1,
      );

      ctx.restore();
    });

    ctx.save(); ctx.fillStyle = "rgba(45,34,57,.24)";
    view.enemies.forEach((enemy) => { if (!enemy.alive || !isVisibleInCamera(enemy.x, enemy.visualBounds.width, cameraX, width)) return; ctx.beginPath(); ctx.ellipse(enemy.x + enemy.collisionBounds.width / 2, enemy.platformY + 3, enemy.visualBounds.width * .36, 5, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.beginPath(); ctx.ellipse(view.player.x + 15, view.player.y + view.player.collisionBounds.height + 4, 18, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    view.projectiles.forEach((projectile) => { if (isVisibleInCamera(projectile.x, projectile.visualBounds.width, cameraX, width)) this.projectileRenderer.render(ctx, projectile); });

    const goalX = getGoalX(level.width);
    if (isVisibleInCamera(goalX - 70, 150, cameraX, width)) {
      this.goalRenderer.render(ctx, {
        x: goalX, biome: level.biome, tick,
        locked: Boolean(view.boss && !view.boss.defeated),
        finishing: view.state === "finishing",
        finalWorld: view.activeLevel === LEVELS.length - 1,
      });
    }
    view.enemies.forEach((enemy) => {
      if (!enemy.alive || !isVisibleInCamera(enemy.x, enemy.visualBounds.width, cameraX, width)) return;
      this.enemyRenderers.get(enemy.type).render({ ctx, enemy, tick });
    });
    this.drawBoss(view);

    view.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / 45); ctx.fillStyle = particle.color;
      const size = particle.size ?? 8;
      ctx.beginPath();ctx.arc(particle.x,particle.y,size/2,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha = 1;
    this.playerRenderer.render({ ctx, player: view.player, frame: view.animationFrame, tick, power: view.activePower });
    if((view.attackTimer??0)>0){
      const progress=1-(view.attackTimer??0)/10;
      ctx.save();ctx.translate(view.player.x+15,view.player.y+24);ctx.scale(view.player.facing,1);
      ctx.globalAlpha=1-progress*.6;ctx.strokeStyle="#a1fff1";ctx.shadowColor="#30e8e0";ctx.shadowBlur=12;ctx.lineWidth=7;
      ctx.beginPath();ctx.arc(8,0,48,-1.3+progress*.7,1.1+progress*.7);ctx.stroke();
      ctx.rotate(-1+progress*2);ctx.fillStyle="#fff5ac";ctx.fillRect(9,-3,46,6);ctx.fillStyle="#f3b631";ctx.fillRect(12,-10,5,20);ctx.restore();
    }
    world.renderForeground(worldContext);
    ctx.restore();

    if (view.boss?.active && !view.boss.defeated) this.drawBossHealth(view);

    if (view.state === "finishing") this.drawFinish(view);
    if (!this.globalReady) this.drawLoading();

    const vignette = ctx.createRadialGradient(width / 2, height / 2, 190, width / 2, height / 2, 650);
    vignette.addColorStop(0.55, "rgba(26,12,58,0)"); vignette.addColorStop(1, level.biome === "meadow" ? "rgba(28,86,76,.18)" : "rgba(26,12,58,.34)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);

    if (view.debug) this.drawDebug(view);
  }

  private drawBoss(view: RenderState) {
    const boss = view.boss;
    if (!boss?.active || boss.defeated) return;
    const { ctx } = this;
    if (boss instanceof CrystalGuardianBoss) {
      renderCrystalGuardian(ctx, boss, view.tick, this.assets.get(GLOBAL_ASSETS.crystalGuardian.id));
      return;
    }
    const image = this.assets.get(
      boss.phase === "charging" ? GLOBAL_ASSETS.salamandraCharge.id :
      boss.phase === "exposed" ? GLOBAL_ASSETS.salamandraExposed.id : GLOBAL_ASSETS.salamandra.id,
    ) ?? this.assets.get(GLOBAL_ASSETS.salamandra.id);
    ctx.save();
    // Ground shadow, anticipation ring and charge trail make the attack readable.
    ctx.fillStyle = "rgba(34,12,27,.52)";
    ctx.beginPath();
    ctx.ellipse(boss.x + boss.width / 2, 455, 87, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    if (boss.phase === "warning") {
      const radius = 85 + Math.sin(view.tick * .3) * 9;
      ctx.strokeStyle = `rgba(255,212,92,${.45 + Math.sin(view.tick * .3) * .3})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(boss.x + boss.width / 2, 447, radius, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (boss.phase === "charging") {
      const trail = ctx.createLinearGradient(boss.x - boss.facing * 100, 0, boss.x + boss.width / 2, 0);
      trail.addColorStop(0, "rgba(255,147,42,0)");
      trail.addColorStop(1, "rgba(255,166,66,.5)");
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.ellipse(boss.x + boss.width / 2 - boss.facing * 52, 421, 85, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (boss.phase === "exposed") {
      ctx.fillStyle = `rgba(255,238,121,${.26 + Math.sin(view.tick * .22) * .15})`;
      ctx.beginPath();
      ctx.ellipse(boss.x + boss.width / 2, boss.y + 42, 95, 51, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (boss.invulnerable > 0 && view.tick % 6 < 3) ctx.globalAlpha = .55;
    if (image) {
      const source = atlasBounds(image, 1, 1, 0, 0);
      const breathing = Math.sin(boss.age * .12) * .018;
      const bob = boss.phase === "charging" ? Math.sin(boss.age * .9) * 3 :
        boss.phase === "exposed" ? 3 + Math.sin(boss.age * .18) * 2 : Math.sin(boss.age * .12) * 2;
      ctx.translate(boss.x + boss.width / 2, 458 + bob);
      ctx.scale(boss.facing === -1 ? 1 : -1, 1);
      ctx.rotate(boss.phase === "charging" ? -.055 : boss.phase === "exposed" ? .035 : 0);
      ctx.scale(boss.phase === "charging" ? 1.08 : 1 + breathing,
        boss.phase === "warning" ? .94 - breathing : boss.phase === "exposed" ? .91 : 1 - breathing);
      ctx.drawImage(image, source.x, source.y, source.width, source.height, -94, -127, 188, 127);
    } else {
      ctx.fillStyle = "#f56726";
      ctx.beginPath();
      ctx.ellipse(boss.x + boss.width / 2, boss.y + 52, 75, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBossHealth(view: RenderState) {
    const boss = view.boss!;
    const crystal = boss instanceof CrystalGuardianBoss;
    const { ctx } = this;
    const width = crystal ? 300 : 260, x = (this.logicalWidth - width) / 2;
    ctx.save();
    ctx.fillStyle = "rgba(31,11,31,.88)";
    ctx.fillRect(x - 12, 14, width + 24, 61);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff4dd";
    ctx.font = "bold 14px Arial";
    ctx.fillText(boss.name.toUpperCase(), this.logicalWidth / 2, 33);
    ctx.fillStyle = "#522632";
    ctx.fillRect(x, 41, width, 12);
    ctx.fillStyle = boss.vulnerable ? "#ffe079" : crystal ? "#69dcf5" : "#ff693d";
    ctx.fillRect(x, 41, width * boss.health / boss.maxHealth, 12);
    if (crystal) {
      ctx.strokeStyle = "rgba(255,255,255,.45)";
      for (let segment = 1; segment < boss.maxHealth; segment++) {
        ctx.beginPath(); ctx.moveTo(x + width * segment / boss.maxHealth, 41);
        ctx.lineTo(x + width * segment / boss.maxHealth, 53); ctx.stroke();
      }
    }
    ctx.strokeStyle = "#ffdec2";
    ctx.strokeRect(x, 41, width, 12);
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "#ffe4be";
    const hint = boss.vulnerable ? "¡AHORA! GOLPEA EL NÚCLEO" : crystal ?
      boss.phase === "warningDash" || boss.phase === "dash" ? "EMBESTIDA · SALTA O APÁRTATE" :
      boss.phase === "warningSlam" || boss.phase === "leap" || boss.phase === "impact" ? "CAÍDA · ALÉJATE DEL CÍRCULO" :
      boss.phase === "warningWaves" || boss.phase === "waves" ? "ONDAS DE CRISTAL · SALTA" :
      boss.phase === "warningBolts" || boss.phase === "barrage" ? "PROYECTILES · MUÉVETE" :
      boss.phase === "stagger" ? "EL GUARDIÁN SE RECOMPONE" : "EL GUARDIÁN DESPIERTA" :
      "ESQUIVA LA EMBESTIDA · ESPERA SU PAUSA";
    ctx.fillText(hint, this.logicalWidth / 2, 69);
    ctx.restore();
  }

  private configureGlobalSprites() {
    const niko =
      this.assets.get(
        GLOBAL_ASSETS.niko.id,
      );

    if (niko) {
      const frameWidth =
        niko.naturalWidth / 7;

      const frameHeight =
        niko.naturalHeight / 4;

      this.playerRenderer =
        new SpritePlayerRenderer({
          image: niko,

          frameWidth,
          frameHeight,

          columns: 7,

          pivotX:
            frameWidth / 2,

          pivotY:
            frameHeight *
            (92 / 96),

          scale: 0.21,
        });
    }

    (
      Object.entries(
        ENEMY_ASSET_BY_TYPE,
      ) as [
        keyof typeof ENEMY_ASSET_BY_TYPE,
        (
          typeof ENEMY_ASSET_BY_TYPE
        )[keyof typeof ENEMY_ASSET_BY_TYPE],
      ][]
    ).forEach(
      ([type, asset]) => {
        const image =
          this.assets.get(
            asset.id,
          );

        if (!image) {
          return;
        }

        this.enemyRenderers.register(
          type,
          new SpriteEnemyRenderer(
            image,
            image.naturalWidth / 6,
            image.naturalHeight,
          ),
        );
      },
    );

    const projectile =
      this.assets.get(
        GLOBAL_ASSETS.projectile.id,
      );

    if (projectile) {
      this.projectileRenderer.setSprite(
        projectile,
      );
    }
  }
  private ensureBiomeAssets(biome: RenderState["level"]["biome"]) { if (biome === "meadow" || this.requestedBiomes.has(biome)) return; this.requestedBiomes.add(biome); void this.assets.preload(worldAssetManifest(biome)); }
  private drawLoading() { const { ctx } = this; ctx.save(); ctx.fillStyle = "rgba(23,11,52,.84)"; ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight); ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "1000 42px Arial"; ctx.fillText("NIKO", this.logicalWidth / 2, 230); ctx.fillStyle = "#ffe047"; ctx.font = "800 17px Arial"; ctx.fillText("Cargando aventura...", this.logicalWidth / 2, 265); ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(this.logicalWidth / 2 - 130, 286, 260, 9); ctx.fillStyle = "#39d8cf"; ctx.fillRect(this.logicalWidth / 2 - 130, 286, 260 * this.assets.progress, 9); ctx.restore(); }

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
    ctx.strokeStyle = "rgba(62,255,210,.95)";
    view.checkpoints.forEach((checkpoint) => ctx.strokeRect(checkpoint.x - 12, checkpoint.y, 34, 58));
    ctx.strokeStyle = "rgba(255,235,70,.95)";
    view.hazards.forEach((hazard) => ctx.strokeRect(hazard.x, hazard.y, hazard.width, hazard.height));
    ctx.restore();

    const biomeRenderer = this.worldRenderer.get(view);
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
      `decorations ${(view.level.decorations ?? []).length}`,
      `ambient ${view.level.biome === "meadow" ? MEADOW_BIOME.ambientParticleCount : 0}`,
      `parallax ${MEADOW_BIOME.layers.map((layer) => layer.speed).join("/")}`,
      `checkpoint ${view.checkpoints.find((item) => item.activated)?.id ?? "ninguno"}`,
      "cyan=player red=enemy orange=projectile",
      "F2: ocultar debug",
    ];
    lines.forEach((line, index) => ctx.fillText(line, 20, 18 + index * 17));
    ctx.restore();
  }
}
