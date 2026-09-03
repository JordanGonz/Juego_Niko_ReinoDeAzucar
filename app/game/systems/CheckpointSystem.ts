import { collisionRect } from "../entities/Player.ts";
import type { Level, Player, RuntimeCheckpoint } from "../types";

export function createCheckpoints(level: Level): RuntimeCheckpoint[] {
  return (level.checkpoints ?? []).map((seed) => {
    const [, platformY] = level.platforms[seed.platformIndex];
    return { id:seed.id, x:seed.x, y:platformY - 58, spawnX:seed.x - 24, spawnY:platformY - 46, activated:false };
  });
}

export function checkpointTouchesPlayer(checkpoint: RuntimeCheckpoint, player: Player) {
  const body=collisionRect(player);
  return body.x + body.width > checkpoint.x - 12 && body.x < checkpoint.x + 22 && body.y + body.height > checkpoint.y && body.y < checkpoint.y + 58;
}

export function activateCheckpoint(checkpoints: RuntimeCheckpoint[], checkpoint: RuntimeCheckpoint) {
  checkpoints.forEach((item)=>{ item.activated=item.id===checkpoint.id; });
  return { x:checkpoint.spawnX, y:checkpoint.spawnY };
}

export function resolveRespawnPosition(fallback:{x:number;y:number}, checkpoints:readonly RuntimeCheckpoint[]) {
  const active=checkpoints.find((checkpoint)=>checkpoint.activated);
  return active ? {x:active.spawnX,y:active.spawnY} : {...fallback};
}
