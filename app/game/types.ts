export type GameState = "ready" | "map" | "playing" | "finishing" | "won" | "lost";
export type Biome = "meadow" | "canyon" | "cave" | "crystal";
export type PickupType = "heart" | "shield" | "boost";
export type GamePower = "" | "ESCUDO" | "TURBO";
export type Facing = -1 | 1;
export type PlayerState = "idle" | "run" | "jumpStart" | "jumpUp" | "fall" | "land" | "skid" | "hurt" | "death" | "victory";
export type Platform = readonly [x: number, y: number, width: number, height: number];
export type EnemyType = "blobHopper" | "spikeBeetle" | "roundBat" | "rollingRock" | "stealthGhost" | "bitePlant" | "robotCannon" | "maskedBandit";
export type EnemyState = "idle" | "patrol" | "alert" | "anticipate" | "airborne" | "land" | "attack" | "phase" | "recover" | "cooldown" | "hurt" | "defeated";
export type EnemySeed = {
  type: EnemyType;
  x: number;
  platformIndex: number;
  facing?: Facing;
  patrolRange?: number;
};
export type DecorationType = "flowerPatch" | "bush" | "tree" | "rock" | "grass" | "mushroom";
export type DecorationLayer = "backgroundMid" | "backgroundNear" | "gameplay" | "foreground";
export type DecorationSeed = { type:DecorationType; x:number; y?:number; platformIndex?:number; layer:DecorationLayer; scale?:number; variant?:number };
export type CheckpointSeed = { id:string; x:number; platformIndex:number };
export type HazardSeed = { id:string; type:"spikes"; x:number; platformIndex:number; width:number; damage:number };
export type Bounds = { offsetX: number; offsetY: number; width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

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
  decorations?: readonly DecorationSeed[];
  checkpoints?: readonly CheckpointSeed[];
  hazards?: readonly HazardSeed[];
};

export type Player = {
  x: number; y: number; vx: number; vy: number;
  grounded: boolean; facing: Facing; inv: number;
  collisionBounds: Bounds;
  visualBounds: Bounds;
  state: PlayerState;
  animationState: PlayerState;
  coyoteTimer: number;
  jumpBufferTimer: number;
  jumpStartTimer: number;
  landingTimer: number;
  skidTimer: number;
  hurtTimer: number;
  runDustTimer: number;
};

export type RuntimeEnemy = {
  id: string;
  type: EnemyType;
  state: EnemyState;
  animationState: EnemyState;
  animationFrame: number;
  animationTimer: number;
  x: number; y: number; vx: number; vy: number;
  spawnX: number; baseY: number; platformY: number;
  minX: number; maxX: number;
  facing: Facing;
  health: number; damage: number;
  alive: boolean; defeated: boolean; stompeable: boolean; contactEnabled: boolean;
  opacity: number;
  collisionBounds: Bounds;
  visualBounds: Bounds;
  stateTimer: number; cooldown: number; phaseTimer: number; age: number;
  detectionRange: number;
};

export type ProjectileType = "cannonBall";
export type RuntimeProjectile = {
  id: string; type: ProjectileType;
  x: number; y: number; vx: number; vy: number;
  damage: number; lifetime: number; alive: boolean;
  collisionBounds: Bounds; visualBounds: Bounds;
};

export type Particle = {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size?: number;
};

export type RuntimeCoin = { x: number; y: number; taken: boolean };
export type RuntimePickup = { x: number; y: number; type: PickupType; taken: boolean };
export type RuntimeCheckpoint = { id:string; x:number; y:number; spawnX:number; spawnY:number; activated:boolean };
export type RuntimeHazard = { id:string; type:"spikes"; x:number; y:number; width:number; height:number; damage:number };

export type GameEvent =
  | { type: "stateChanged"; value: GameState }
  | { type: "levelChanged"; value: number; coinGoal: number }
  | { type: "scoreChanged"; value: number }
  | { type: "coinsChanged"; value: number }
  | { type: "livesChanged"; value: number }
  | { type: "powerChanged"; value: GamePower }
  | { type: "unlockedLevelChanged"; value: number };

export type RenderState = {
  level: Level;
  activeLevel: number;
  state: GameState;
  player: Player;
  enemies: readonly RuntimeEnemy[];
  projectiles: readonly RuntimeProjectile[];
  coins: readonly RuntimeCoin[];
  pickups: readonly RuntimePickup[];
  checkpoints: readonly RuntimeCheckpoint[];
  hazards: readonly RuntimeHazard[];
  particles: readonly Particle[];
  activePower: GamePower;
  cameraX: number;
  tick: number;
  finishTimer: number;
  debug: boolean;
  fps: number;
  fixedUpdateRate: number;
  animationFrame: number;
};
