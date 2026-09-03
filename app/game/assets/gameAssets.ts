import type { EnemyType, Biome } from "../types.ts";
import type { AssetDefinition } from "./AssetManager.ts";

export const GLOBAL_ASSETS={
  niko:{id:"character-niko",src:"/game/characters/niko/niko_atlas.png"},
  collectibles:{id:"global-collectibles",src:"/game/worlds/meadow/gameplay/meadow_gameplay_atlas.png"},
  projectile:{id:"projectile-cannonball",src:"/game/projectiles/cannonball/atlas.png"},
  blobHopper:{id:"enemy-blob",src:"/game/enemies/blob/atlas.png"},
  spikeBeetle:{id:"enemy-beetle",src:"/game/enemies/beetle/atlas.png"},
  roundBat:{id:"enemy-bat",src:"/game/enemies/bat/atlas.png"},
  stealthGhost:{id:"enemy-ghost",src:"/game/enemies/ghost/atlas.png"},
  bitePlant:{id:"enemy-plant",src:"/game/enemies/plant/atlas.png"},
  robotCannon:{id:"enemy-cannon",src:"/game/enemies/cannon/atlas.png"},
  maskedBandit:{id:"enemy-bandit",src:"/game/enemies/bandit/atlas.png"},
  rollingRock:{id:"enemy-rock",src:"/game/enemies/rock/atlas.png"},
} as const satisfies Record<string,AssetDefinition>;

export const GLOBAL_ASSET_MANIFEST=Object.values(GLOBAL_ASSETS);
export const ENEMY_ASSET_BY_TYPE:Record<EnemyType,AssetDefinition>={
  blobHopper:GLOBAL_ASSETS.blobHopper,spikeBeetle:GLOBAL_ASSETS.spikeBeetle,roundBat:GLOBAL_ASSETS.roundBat,
  stealthGhost:GLOBAL_ASSETS.stealthGhost,bitePlant:GLOBAL_ASSETS.bitePlant,robotCannon:GLOBAL_ASSETS.robotCannon,
  maskedBandit:GLOBAL_ASSETS.maskedBandit,rollingRock:GLOBAL_ASSETS.rollingRock,
};

const world=(folder:string)=>({
  far:{id:`${folder}-far`,src:`/game/worlds/${folder}/background/far.png`},
  mid:{id:`${folder}-mid`,src:`/game/worlds/${folder}/background/mid.png`},
  tiles:{id:`${folder}-tiles`,src:`/game/worlds/${folder}/tiles/atlas.png`},
  decorations:{id:`${folder}-decorations`,src:`/game/worlds/${folder}/decorations/atlas.png`},
  gameplay:{id:`${folder}-gameplay`,src:`/game/worlds/${folder}/gameplay/atlas.png`},
} as const);
export const WORLD_ASSETS={canyon:world("volcano-or-canyon"),cave:world("crystal-cave"),crystal:world("sky-ruins")} as const;
export function worldAssetManifest(biome:Biome):readonly AssetDefinition[]{
  if(biome==="meadow")return[];return Object.values(WORLD_ASSETS[biome]);
}
