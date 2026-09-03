import type { Rect, RuntimeProjectile } from "../types";

export function projectileCollisionRect(projectile: RuntimeProjectile): Rect {
  const bounds = projectile.collisionBounds;
  return { x:projectile.x + bounds.offsetX, y:projectile.y + bounds.offsetY, width:bounds.width, height:bounds.height };
}
