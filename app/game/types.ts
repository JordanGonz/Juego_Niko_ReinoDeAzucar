export type GameState = "ready" | "map" | "playing" | "finishing" | "won" | "lost";
export type Biome = "meadow" | "canyon" | "cave" | "crystal";
export type PickupType = "heart" | "shield" | "boost";
export type GamePower = "" | "ESCUDO" | "TURBO";
export type Platform = readonly [x: number, y: number, width: number, height: number];
export type EnemySeed = readonly [x: number, platformIndex: number];

export type Level = {
  name: string;
  mission: string;
  width: number;
  biome: Biome;
  friction: number;
  jumpForce: number;
  sky: readonly [string, string, string];
  platforms: readonly Platform[];
  coins: readonly (readonly [number, number])[];
  pickups: readonly (readonly [x: number, y: number, type: PickupType])[];
  enemies: readonly EnemySeed[];
};

export type Player = {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number; grounded: boolean; facing: number; inv: number;
};

export type RuntimeEnemy = {
  x: number; y: number; vx: number; minX: number; maxX: number; alive: boolean;
};

export type Particle = {
  x: number; y: number; vx: number; vy: number; life: number; color: string;
};
