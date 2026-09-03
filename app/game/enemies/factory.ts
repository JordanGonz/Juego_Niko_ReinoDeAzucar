import { ENEMY_DEFINITIONS } from "./definitions.ts";
import type { EnemySeed, Level, RuntimeEnemy } from "../types";

export function createEnemy(seed: EnemySeed, index: number, level: Level): RuntimeEnemy {
  const definition = ENEMY_DEFINITIONS[seed.type];
  const [platformX, platformY, platformWidth] = level.platforms[seed.platformIndex];
  const spawnY = definition.flying ? platformY - 105 : platformY - definition.collisionBounds.height;
  const facing = seed.facing ?? (index % 2 ? -1 : 1);
  const range = seed.patrolRange ?? Math.min(120, platformWidth / 2 - 24);
  return {
    id: `${seed.type}-${index}`,
    type: seed.type,
    state: definition.initialState,
    animationState: definition.initialState,
    animationFrame: 0,
    animationTimer: 0,
    x: seed.x, y: spawnY, vx: facing * definition.patrolSpeed, vy: 0,
    spawnX: seed.x, baseY: spawnY, platformY,
    minX: Math.max(platformX + 12, seed.x - range),
    maxX: Math.min(platformX + platformWidth - definition.collisionBounds.width - 12, seed.x + range),
    facing,
    health: definition.health, damage: definition.damage,
    alive: true, defeated: false, stompeable: true, contactEnabled: true,
    opacity: 1,
    collisionBounds: { ...definition.collisionBounds },
    visualBounds: { ...definition.visualBounds },
    stateTimer: 0, cooldown: 0, phaseTimer: 0, age: 0,
    detectionRange: definition.detectionRange,
  };
}

export function createEnemies(level: Level): RuntimeEnemy[] {
  return level.enemies.map((seed, index) => createEnemy(seed, index, level));
}
