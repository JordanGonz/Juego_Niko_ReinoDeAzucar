import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { AssetManager } from "../app/game/assets/AssetManager.ts";
import { coinBounds, pickupBounds } from "../app/game/entities/Collectible.ts";
import { createPlayer } from "../app/game/entities/Player.ts";
import { LEVELS } from "../app/game/levels.ts";
import { resolveDecorationY } from "../app/game/rendering/world/DecorationRenderer.ts";
import { calculateParallaxOffset } from "../app/game/rendering/world/ParallaxLayer.ts";
import { selectWorldRendererId } from "../app/game/rendering/world/WorldRenderer.ts";
import { MEADOW_BIOME } from "../app/game/rendering/world/biomes/meadow.ts";
import { checkpointAtlasCell, isVisibleInCamera, meadowBackgroundMode, MEADOW_ASSET_MANIFEST, pickupAtlasCell } from "../app/game/rendering/world/meadowAssets.ts";
import { ENEMY_ASSET_BY_TYPE, GLOBAL_ASSET_MANIFEST, WORLD_ASSETS, worldAssetManifest } from "../app/game/assets/gameAssets.ts";
import { activateCheckpoint, checkpointTouchesPlayer, createCheckpoints, resolveRespawnPosition } from "../app/game/systems/CheckpointSystem.ts";
import { createHazards, damagePlayerFromHazard, hazardHitsPlayer } from "../app/game/systems/HazardSystem.ts";

test("BiomeDefinition de Pradera Brillante existe y declara sus capas",()=>{
  assert.equal(MEADOW_BIOME.id,"meadow");assert.equal(MEADOW_BIOME.name,"Pradera Brillante");assert.equal(MEADOW_BIOME.layers.length,5);
});

test("el checkpoint se activa al tocar su bandera",()=>{
  const checkpoints=createCheckpoints(LEVELS[0]);const target=createPlayer();target.x=checkpoints[0].x-5;target.y=checkpoints[0].spawnY;
  assert.equal(checkpointTouchesPlayer(checkpoints[0],target),true);activateCheckpoint(checkpoints,checkpoints[0]);assert.equal(checkpoints[0].activated,true);
});

test("el respawn prefiere el checkpoint activo y conserva el fallback",()=>{
  const checkpoints=createCheckpoints(LEVELS[0]);const fallback={x:100,y:412};
  assert.deepEqual(resolveRespawnPosition(fallback,checkpoints),fallback);activateCheckpoint(checkpoints,checkpoints[0]);assert.deepEqual(resolveRespawnPosition(fallback,checkpoints),{x:checkpoints[0].spawnX,y:checkpoints[0].spawnY});
});

test("los pinchos detectan contacto y aplican daño con rebote",()=>{
  const hazard=createHazards(LEVELS[0])[0],target=createPlayer();target.x=hazard.x+4;target.y=hazard.y-40;
  assert.equal(hazardHitsPlayer(hazard,target),true);assert.equal(damagePlayerFromHazard(target,hazard),1);assert.equal(target.inv,100);assert.ok(target.vy<0);
});

test("resolver decoración no modifica la geometría de colisión",()=>{
  const before=structuredClone(LEVELS[0].platforms);const item=LEVELS[0].decorations.find((entry)=>entry.platformIndex!==undefined);
  assert.equal(resolveDecorationY(item,LEVELS[0]),LEVELS[0].platforms[item.platformIndex][1]);assert.deepEqual(LEVELS[0].platforms,before);
});

test("parallax calcula offsets proporcionales a cada profundidad",()=>{
  assert.equal(calculateParallaxOffset(400,.1),-40);assert.equal(calculateParallaxOffset(400,.42),-168);assert.equal(calculateParallaxOffset(400,1.1),-440.00000000000006);
});

test("WorldRenderer selecciona Pradera y conserva fallback legado",()=>{
  assert.equal(selectWorldRendererId("meadow"),"meadow");assert.equal(selectWorldRendererId("cave"),"cave-assets");
});

test("collectibles mantienen bounds estables separados del dibujo",()=>{
  assert.deepEqual(coinBounds(20,30),{x:6,y:16,width:28,height:28});assert.equal(pickupBounds(20,30,"shield").width,38);assert.equal(pickupBounds(20,30,"heart").width,36);
});

test("el pipeline permite fallback cuando no hay assets cargados",()=>{
  const manager=new AssetManager(()=>({}));assert.equal(manager.get("meadow-tiles"),null);assert.equal(selectWorldRendererId("meadow"),"meadow");
});

test("AssetManager reutiliza recursos y promesas existentes",async()=>{
  let creations=0;
  const manager=new AssetManager(()=>{creations++;const fake={onload:null,onerror:null,_src:""};Object.defineProperty(fake,"src",{set(value){fake._src=value;queueMicrotask(()=>fake.onload());}});return fake;});
  const first=manager.load("tiles","/tiles.png"),second=manager.load("tiles","/tiles.png");assert.equal(first,second);const loaded=await first;assert.equal(creations,1);assert.equal(manager.get("tiles"),loaded);await manager.load("tiles","/tiles.png");assert.equal(creations,1);
});

test("el manifiesto declara cuatro assets de pradera presentes",()=>{
  assert.equal(MEADOW_ASSET_MANIFEST.length,4);
  MEADOW_ASSET_MANIFEST.forEach(({src})=>assert.equal(existsSync(resolve(`public${src}`)),true));
});

test("AssetManager precarga el manifiesto sin recrear imágenes",async()=>{
  let creations=0;const manager=new AssetManager(()=>{creations++;const fake={onload:null,onerror:null};Object.defineProperty(fake,"src",{set(){queueMicrotask(()=>fake.onload());}});return fake;});
  const results=await manager.preload(MEADOW_ASSET_MANIFEST);assert.equal(results.every((item)=>item.status==="fulfilled"),true);assert.equal(creations,4);
  await manager.preload(MEADOW_ASSET_MANIFEST);assert.equal(creations,4);
});

test("Pradera selecciona asset cargado o fallback Canvas",()=>{
  assert.equal(meadowBackgroundMode(null),"fallback");assert.equal(meadowBackgroundMode({}),"asset");
});

test("el culling conserva objetos cercanos y omite los lejanos",()=>{
  assert.equal(isVisibleInCamera(900,80,800,960),true);assert.equal(isVisibleInCamera(2100,80,800,960),false);assert.equal(isVisibleInCamera(700,80,800,960),true);
});

test("checkpoint activo e inactivo usan celdas visuales distintas",()=>{
  assert.deepEqual(checkpointAtlasCell(false),{column:0,row:0});assert.deepEqual(checkpointAtlasCell(true),{column:1,row:0});
});

test("los bounds del peligro conservan la geometría del nivel",()=>{
  const seed=LEVELS[0].hazards[0],hazard=createHazards(LEVELS[0])[0];assert.equal(hazard.x,seed.x);assert.equal(hazard.width,seed.width);assert.ok(hazard.height>0);assert.equal(hazard.damage,seed.damage);
});

test("coleccionables mantienen bounds y celdas por tipo",()=>{
  assert.deepEqual(pickupAtlasCell("heart"),{column:0,row:1});assert.deepEqual(pickupAtlasCell("shield"),{column:1,row:1});assert.deepEqual(pickupAtlasCell("boost"),{column:2,row:1});assert.deepEqual(coinBounds(100,80),{x:86,y:66,width:28,height:28});
});

test("los tres biomas finales registran manifests completos y lazy",()=>{
  assert.equal(worldAssetManifest("meadow").length,0);for(const biome of ["canyon","cave","crystal"]){assert.equal(worldAssetManifest(biome).length,5);assert.ok(WORLD_ASSETS[biome].far.src.endsWith("far.png"));}
});

test("el manifiesto global incluye Niko, ocho enemigos, collectibles y proyectil",()=>{
  assert.equal(Object.keys(ENEMY_ASSET_BY_TYPE).length,8);assert.equal(GLOBAL_ASSET_MANIFEST.length,11);assert.ok(GLOBAL_ASSET_MANIFEST.some((asset)=>asset.id==="character-niko"));
});

test("AssetManager reporta fallos y conserva fallback",async()=>{
  const manager=new AssetManager(()=>{const fake={onload:null,onerror:null};Object.defineProperty(fake,"src",{set(){queueMicrotask(()=>fake.onerror());}});return fake;});const result=await manager.preload([{id:"missing",src:"/missing.png"}]);assert.equal(result[0].status,"rejected");assert.equal(manager.errors.length,1);assert.equal(manager.get("missing"),null);assert.equal(manager.progress,1);
});

test("AssetManager puede liberar assets de un mundo",async()=>{
  const manager=new AssetManager(()=>{const fake={onload:null,onerror:null};Object.defineProperty(fake,"src",{set(){queueMicrotask(()=>fake.onload());}});return fake;});await manager.load("world","/world.png");assert.equal(manager.has("world"),true);manager.release(["world"]);assert.equal(manager.has("world"),false);
});
