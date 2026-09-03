import { FLOOR } from "../../levels.ts";
import type { Biome } from "../../types.ts";
import { WORLD_ASSETS } from "../../assets/gameAssets.ts";
import { LegacyBiomeRenderer } from "./LegacyBiomeRenderer.ts";
import { drawAtlasCell, isVisibleInCamera } from "./meadowAssets.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types.ts";

const AMBIENT: Record<
  Exclude<Biome, "meadow">,
  { color: string; accent: string }
> = {
  canyon: { color: "#ffb347", accent: "#ff6338" },
  cave: { color: "#6ff7ff", accent: "#e874ff" },
  crystal: { color: "#fff8c7", accent: "#8ceaff" },
};

function cover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const target = width / height;
  const ratio = image.naturalWidth / image.naturalHeight;

  const sw =
    ratio > target
      ? image.naturalHeight * target
      : image.naturalWidth;

  const sh =
    ratio > target
      ? image.naturalHeight
      : image.naturalWidth / target;

  ctx.drawImage(
    image,
    (image.naturalWidth - sw) / 2,
    (image.naturalHeight - sh) / 2,
    sw,
    sh,
    0,
    0,
    width,
    height,
  );
}

export class AssetBiomeRenderer implements BiomeRenderer {
  readonly id: string;

  private readonly legacy = new LegacyBiomeRenderer();

  constructor(private readonly biome: Exclude<Biome, "meadow">) {
    this.id = `${biome}-assets`;
  }

  renderBackground(context: WorldRenderContext) {
    const { ctx, assets, width, height, view } = context;

    const set = WORLD_ASSETS[this.biome];
    const far = assets.get(set.far.id);
    const mid = assets.get(set.mid.id);

    if (far) {
      cover(ctx, far, width, height);
    } else {
      this.legacy.renderBackground(context);
    }

    if (mid) {
      const drawHeight = height * 0.58;

      const drawWidth = Math.max(
        width * 1.55,
        mid.naturalWidth * (drawHeight / mid.naturalHeight),
      );

      const offset = -(view.cameraX * 0.23 % drawWidth);

      ctx.save();
      ctx.globalAlpha = 0.82;

      ctx.drawImage(
        mid,
        offset,
        FLOOR - drawHeight + 30,
        drawWidth,
        drawHeight,
      );

      ctx.drawImage(
        mid,
        offset + drawWidth,
        FLOOR - drawHeight + 30,
        drawWidth,
        drawHeight,
      );

      ctx.restore();
    }

    const palette = AMBIENT[this.biome];

    for (let i = 0; i < 12; i++) {
      const x =
        (i * 193 + view.tick * (i % 3 + 1) * 0.18) % width;

      const y =
        70 + (i * 79) % (height - 120);

      ctx.globalAlpha = 0.18 + (i % 3) * 0.1;
      ctx.fillStyle =
        i % 2 ? palette.color : palette.accent;

      const size = 2 + (i % 2);
      ctx.fillRect(x, y, size, size);
    }

    ctx.globalAlpha = 1;
  }

  renderPlatforms(context: WorldRenderContext) {
    const {
      ctx,
      view,
      assets,
      width: viewport,
    } = context;

    const atlas =
      assets.get(WORLD_ASSETS[this.biome].tiles.id);

    if (!atlas) {
      this.legacy.renderPlatforms(context);
      return;
    }

    view.level.platforms.forEach(([x, y, w, h]) => {
      if (
        !isVisibleInCamera(
          x,
          w,
          view.cameraX,
          viewport,
        )
      ) {
        return;
      }

      const ground = y >= 450;

      const column = ground
        ? 1
        : w <= 145
          ? 3
          : w < 220
            ? 0
            : 1;

      const row = ground ? 0 : 1;

      /*
       * Importante:
       * dibujamos la plataforma tomando como referencia
       * EXACTAMENTE su ancho lógico.
       *
       * Antes se añadían +36 px al ancho y -18 px al X,
       * lo que provocaba que la imagen no coincidiera
       * con la caja amarilla del debug.
       */
      const drawX = x;
      const drawWidth = w;

      /*
       * La parte visible superior de la plataforma
       * debe apoyarse en y.
       */
      const visualHeight = ground
        ? Math.max(78, h + 45)
        : Math.max(64, h + 42);

      const drawY = y - 28;

      ctx.save();

      ctx.shadowColor = "rgba(16,10,35,.20)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 5;

      drawAtlasCell(
        ctx,
        atlas,
        { column, row },
        4,
        2,
        drawX,
        drawY,
        drawWidth,
        visualHeight,
      );

      ctx.restore();
    });
  }

  renderGameplay({
    ctx,
    view,
    assets,
    width,
  }: WorldRenderContext) {
    const set =
      WORLD_ASSETS[this.biome];

    const decor =
      assets.get(set.decorations.id);

    const gameplay =
      assets.get(set.gameplay.id);

    /*
     * Decoraciones:
     * antes podían medir 70-92px y se colocaban
     * en casi todas las plataformas.
     *
     * Ahora son más pequeñas y menos frecuentes.
     */
    if (decor) {
      view.level.platforms.forEach(
        ([x, y, w], index) => {
          if (
            index > 7 ||
            !isVisibleInCamera(
              x,
              w,
              view.cameraX,
              width,
            )
          ) {
            return;
          }

          /*
           * Evita llenar cada plataforma de elementos.
           */
          if (index % 2 !== 0) {
            return;
          }

          const column = index % 4;
          const row = index % 2;

          const size =
            index % 3 === 0 ? 52 : 42;

          const position =
            0.30 + (index % 3) * 0.20;

          const decorX =
            x + w * position - size / 2;

          const decorY =
            y - size + 4;

          ctx.save();
          ctx.globalAlpha = 0.78;

          drawAtlasCell(
            ctx,
            decor,
            { column, row },
            4,
            2,
            decorX,
            decorY,
            size,
            size,
          );

          ctx.restore();
        },
      );
    }

    if (gameplay) {
      view.checkpoints.forEach((item) => {
        if (
          !isVisibleInCamera(
            item.x,
            70,
            view.cameraX,
            width,
          )
        ) {
          return;
        }

        drawAtlasCell(
          ctx,
          gameplay,
          {
            column:
              item.activated ? 1 : 0,
            row: 0,
          },
          4,
          2,
          item.x - 32,
          item.y - 35,
          68,
          68,
        );
      });

      view.hazards.forEach((item) => {
        if (
          !isVisibleInCamera(
            item.x,
            item.width,
            view.cameraX,
            width,
          )
        ) {
          return;
        }

        drawAtlasCell(
          ctx,
          gameplay,
          { column: 2, row: 0 },
          4,
          2,
          item.x,
          item.y - 30,
          item.width,
          48,
        );
      });
    }
  }

  renderForeground({
    ctx,
    view,
    assets,
    width,
  }: WorldRenderContext) {
    const image =
      assets.get(
        WORLD_ASSETS[this.biome]
          .decorations.id,
      );

    if (!image) {
      return;
    }

    ctx.save();

    ctx.translate(
      -view.cameraX * 0.1,
      0,
    );

    ctx.globalAlpha = 0.18;

    const positions = [
      view.cameraX * 1.1 - 70,
      view.cameraX * 1.1 + width - 80,
    ];

    positions.forEach(
      (x, index) => {
        drawAtlasCell(
          ctx,
          image,
          {
            column: index ? 3 : 0,
            row: 1,
          },
          4,
          2,
          x,
          FLOOR - 18,
          index ? 95 : 80,
          90,
        );
      },
    );

    ctx.restore();
  }
}