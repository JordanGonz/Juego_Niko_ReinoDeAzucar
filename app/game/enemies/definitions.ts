import type { Bounds, EnemyState, EnemyType } from "../types";

export type EnemyDefinition = {
  type: EnemyType;
  initialState: EnemyState;
  health: number;
  damage: number;
  detectionRange: number;
  patrolSpeed: number;
  collisionBounds: Bounds;
  visualBounds: Bounds;
  flying?: boolean;
  stationary?: boolean;
};

const bounds = (width: number, height: number): Bounds => ({ offsetX: 0, offsetY: 0, width, height });
const visual = (width: number, height: number, bodyWidth: number, bodyHeight: number): Bounds => ({
  offsetX: (bodyWidth - width) / 2,
  offsetY: bodyHeight - height,
  width,
  height,
});

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
  blobHopper: { type:"blobHopper", initialState:"idle", health:1, damage:1, detectionRange:230, patrolSpeed:0, collisionBounds:bounds(34,28), visualBounds:visual(42,36,34,28) },
  spikeBeetle: { type:"spikeBeetle", initialState:"patrol", health:1, damage:1, detectionRange:245, patrolSpeed:1, collisionBounds:bounds(38,28), visualBounds:visual(48,38,38,28) },
  roundBat: { type:"roundBat", initialState:"patrol", health:1, damage:1, detectionRange:225, patrolSpeed:0.8, collisionBounds:bounds(34,24), visualBounds:visual(52,38,34,24), flying:true },
  rollingRock: { type:"rollingRock", initialState:"attack", health:1, damage:1, detectionRange:0, patrolSpeed:2.35, collisionBounds:bounds(38,38), visualBounds:visual(46,46,38,38) },
  stealthGhost: { type:"stealthGhost", initialState:"phase", health:1, damage:1, detectionRange:260, patrolSpeed:0.7, collisionBounds:bounds(32,30), visualBounds:visual(46,40,32,30), flying:true },
  bitePlant: { type:"bitePlant", initialState:"idle", health:1, damage:1, detectionRange:145, patrolSpeed:0, collisionBounds:bounds(34,40), visualBounds:visual(48,54,34,40), stationary:true },
  robotCannon: { type:"robotCannon", initialState:"idle", health:1, damage:1, detectionRange:370, patrolSpeed:0, collisionBounds:bounds(44,34), visualBounds:visual(56,44,44,34), stationary:true },
  maskedBandit: { type:"maskedBandit", initialState:"patrol", health:1, damage:1, detectionRange:260, patrolSpeed:1.15, collisionBounds:bounds(30,42), visualBounds:visual(42,52,30,42) },
};

export const RESERVED_BOSS_TYPES = ["stoneGolem", "drillMole", "stormCloud", "fireSalamander", "wizardOwl", "guardianCrab"] as const;
