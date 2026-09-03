import type { EnemyType } from "../../types";
import type { EnemyRenderer } from "./EnemyRenderer.ts";
import { PlaceholderEnemyRenderer } from "./PlaceholderEnemyRenderer.ts";

export function selectEnemyRendererKind(hasSprite: boolean) { return hasSprite ? "sprite" : "placeholder"; }

export class EnemyRendererFactory {
  private readonly fallback = new PlaceholderEnemyRenderer();
  private readonly sprites = new Map<EnemyType, EnemyRenderer>();
  register(type:EnemyType, renderer:EnemyRenderer) { this.sprites.set(type,renderer); }
  get(type:EnemyType) { return this.sprites.get(type) ?? this.fallback; }
}
