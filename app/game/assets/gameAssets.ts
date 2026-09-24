import type { EnemyType, Biome } from "../types.ts";
import type { AssetDefinition } from "./AssetManager.ts";

export const GLOBAL_ASSETS={
  niko:{id:"character-niko",src:"/game/characters/niko/niko_atlas.webp"},
  salamandra:{id:"boss-salamandra",src:"/game/bosses/salamandra-ignea/sprite.webp"},
  salamandraCharge:{id:"boss-salamandra-charge",src:"/game/bosses/salamandra-ignea/charge.webp"},
  salamandraExposed:{id:"boss-salamandra-exposed",src:"/game/bosses/salamandra-ignea/exposed.webp"},
  crystalGuardian:{id:"boss-crystal-guardian",src:"/game/bosses/guardian-celeste/sprite.webp"},
  collectibles:{id:"global-collectibles",src:"/game/worlds/meadow/gameplay/meadow_gameplay_atlas.webp"},
  projectile:{id:"projectile-cannonball",src:"/game/projectiles/cannonball/atlas.webp"},
  blobHopper:{id:"enemy-blob",src:"/game/enemies/blob/atlas.webp"},
  spikeBeetle:{id:"enemy-beetle",src:"/game/enemies/beetle/atlas.webp"},
  roundBat:{id:"enemy-bat",src:"/game/enemies/bat/atlas.webp"},
  stealthGhost:{id:"enemy-ghost",src:"/game/enemies/ghost/atlas.webp"},
  bitePlant:{id:"enemy-plant",src:"/game/enemies/plant/atlas.webp"},
  robotCannon:{id:"enemy-cannon",src:"/game/enemies/cannon/atlas.webp"},
  maskedBandit:{id:"enemy-bandit",src:"/game/enemies/bandit/atlas.webp"},
  rollingRock:{id:"enemy-rock",src:"/game/enemies/rock/atlas.webp"},
} as const satisfies Record<string,AssetDefinition>;

const BOSS_ASSET_MANIFEST=[GLOBAL_ASSETS.salamandra,GLOBAL_ASSETS.salamandraCharge,GLOBAL_ASSETS.salamandraExposed,GLOBAL_ASSETS.crystalGuardian];
export const GLOBAL_ASSET_MANIFEST=Object.values(GLOBAL_ASSETS).filter(asset=>!BOSS_ASSET_MANIFEST.some(boss=>boss.id===asset.id));
export const ENEMY_ASSET_BY_TYPE:Record<EnemyType,AssetDefinition>={
  blobHopper:GLOBAL_ASSETS.blobHopper,spikeBeetle:GLOBAL_ASSETS.spikeBeetle,roundBat:GLOBAL_ASSETS.roundBat,
  stealthGhost:GLOBAL_ASSETS.stealthGhost,bitePlant:GLOBAL_ASSETS.bitePlant,robotCannon:GLOBAL_ASSETS.robotCannon,
  maskedBandit:GLOBAL_ASSETS.maskedBandit,rollingRock:GLOBAL_ASSETS.rollingRock,
};

const world=(folder:string)=>({
  far:{id:`${folder}-far`,src:`/game/worlds/${folder}/background/far.webp`},
  mid:{id:`${folder}-mid`,src:`/game/worlds/${folder}/background/mid.webp`},
  tiles:{id:`${folder}-tiles`,src:`/game/worlds/${folder}/tiles/atlas.webp`},
  decorations:{id:`${folder}-decorations`,src:`/game/worlds/${folder}/decorations/atlas.webp`},
  gameplay:{id:`${folder}-gameplay`,src:`/game/worlds/${folder}/gameplay/atlas.webp`},
} as const);
export const WORLD_ASSETS={canyon:world("volcano-or-canyon"),cave:world("crystal-cave"),crystal:world("sky-ruins")} as const;
export function worldAssetManifest(biome:Biome):readonly AssetDefinition[]{
  if(biome==="meadow")return[];
  if(biome==="canyon")return [...Object.values(WORLD_ASSETS.canyon),GLOBAL_ASSETS.salamandra,GLOBAL_ASSETS.salamandraCharge,GLOBAL_ASSETS.salamandraExposed];
  if(biome==="crystal")return [...Object.values(WORLD_ASSETS.crystal),GLOBAL_ASSETS.crystalGuardian];
  return Object.values(WORLD_ASSETS[biome]);
}
