import assert from "node:assert/strict";
import test from "node:test";
import { createPlayer } from "../app/game/entities/Player.ts";
import { classifyEnemyContact, damagePlayerFromEnemy, defeatEnemy } from "../app/game/enemies/collision.ts";
import { getEnemyDebugData } from "../app/game/enemies/debug.ts";
import { createEnemy } from "../app/game/enemies/factory.ts";
import { updateEnemyBehavior } from "../app/game/enemies/behaviors/index.ts";
import { LEVELS } from "../app/game/levels.ts";
import { selectEnemyRendererKind } from "../app/game/rendering/enemy/EnemyRendererFactory.ts";
import { ParticleSystem } from "../app/game/systems/ParticleSystem.ts";
import { damagePlayerFromProjectile, ProjectileSystem, projectileHitsPlayer } from "../app/game/systems/ProjectileSystem.ts";

const TYPES = ["blobHopper","spikeBeetle","roundBat","stealthGhost","bitePlant","robotCannon","maskedBandit","rollingRock"];
const particles = new ParticleSystem();
const player = () => createPlayer();
function enemy(type, x=220) { return createEnemy({ type, x, platformIndex:0 }, 0, LEVELS[0]); }
function context(target, fireProjectile=()=>{}) { return { player:target, particles, fireProjectile }; }
function step(subject, ctx, count) { for(let i=0;i<count;i++) updateEnemyBehavior(subject,ctx); }

test("la fábrica crea los ocho tipos con bounds separados", () => {
  for(const type of TYPES) {
    const item=enemy(type); assert.equal(item.type,type); assert.ok(item.collisionBounds.width>0); assert.ok(item.visualBounds.width>=item.collisionBounds.width);
  }
});

test("Blob Hopper anticipa, salta, aterriza y se recupera", () => {
  const target=player(); target.x=180; const item=enemy("blobHopper");
  step(item,context(target),1); assert.equal(item.state,"anticipate");
  step(item,context(target),24); assert.equal(item.state,"airborne");
  step(item,context(target),80); assert.ok(["land","recover","idle","anticipate","airborne"].includes(item.state));
});

test("pisotón descendente derrota a un enemigo vulnerable", () => {
  const item=enemy("blobHopper"); const target=player();
  target.x=item.x+2; target.y=item.y-target.collisionBounds.height+10; target.vy=6;
  assert.equal(classifyEnemyContact(target,item),"stomp"); assert.equal(defeatEnemy(item),true); assert.equal(item.defeated,true);
});

test("contacto lateral daña y empuja a Niko", () => {
  const item=enemy("maskedBandit"); const target=player(); target.x=item.x-20; target.y=item.y;
  assert.equal(classifyEnemyContact(target,item),"side"); assert.equal(damagePlayerFromEnemy(target,item),1); assert.equal(target.inv,100); assert.ok(target.vx<0);
});

test("Spike Beetle avisa y rueda sin poder ser pisado", () => {
  const target=player(); target.x=230; const item=enemy("spikeBeetle");
  step(item,context(target),23); assert.equal(item.state,"attack");
  step(item,context(target),1); assert.equal(item.stompeable,false);
});

test("Round Bat patrulla en una onda vertical", () => {
  const target=player(); target.x=2000; target.y=0; const item=enemy("roundBat"); const initial=item.y;
  step(item,context(target),8); assert.notEqual(item.y,initial);
});

test("Stealth Ghost alterna fase intangible y ventana de ataque", () => {
  const target=player(); target.x=230; const item=enemy("stealthGhost");
  step(item,context(target),1); assert.equal(item.contactEnabled,false); assert.ok(item.opacity<.3);
  step(item,context(target),70); assert.equal(item.contactEnabled,true); assert.ok(item.opacity>.8);
});

test("Bite Plant ejecuta mordida y entra en cooldown", () => {
  const target=player(); target.x=230; const item=enemy("bitePlant");
  step(item,context(target),29); assert.equal(item.state,"attack"); assert.equal(item.stompeable,false);
  step(item,context(target),20); assert.equal(item.state,"cooldown");
});

test("Robot Cannon crea un proyectil después de anticipar", () => {
  const target=player(); target.x=230; const item=enemy("robotCannon"); const system=new ProjectileSystem();
  step(item,context(target,(source)=>system.fireCannonBall(source)),35);
  assert.equal(system.projectiles.length,1); assert.equal(item.state,"cooldown");
});

test("el proyectil detecta a Niko, se consume y comunica su daño", () => {
  const target=player(); const item=enemy("robotCannon",70); item.facing=1; const system=new ProjectileSystem();
  const shot=system.fireCannonBall(item); shot.x=target.x; shot.y=target.y+10;
  assert.equal(projectileHitsPlayer(shot,target),true); const hit=system.consumePlayerHit(target);
  assert.equal(damagePlayerFromProjectile(target,hit),1); assert.equal(target.inv,100); assert.equal(hit.alive,false);
});

test("Masked Bandit detecta, persigue y vuelve a patrulla", () => {
  const target=player(); target.x=230; const item=enemy("maskedBandit");
  step(item,context(target),15); assert.equal(item.state,"attack");
  target.x=2000; step(item,context(target),1); assert.equal(item.state,"recover");
  step(item,context(target),28); assert.equal(item.state,"patrol");
});

test("Rolling Rock rebota en sus límites con recuperación legible", () => {
  const target=player(); const item=enemy("rollingRock"); item.x=item.maxX-.5; item.vx=2.35;
  step(item,context(target),1); assert.equal(item.state,"recover"); assert.equal(item.stompeable,false);
  step(item,context(target),12); assert.equal(item.state,"attack"); assert.ok(item.vx<0);
});

test("la factoría visual elige sprite o placeholder explícitamente", () => {
  assert.equal(selectEnemyRendererKind(false),"placeholder"); assert.equal(selectEnemyRendererKind(true),"sprite");
});

test("el modo debug expone estado, vida, rango y ambos bounds", () => {
  const data=getEnemyDebugData(enemy("stealthGhost"));
  assert.equal(data.type,"stealthGhost"); assert.equal(data.health,1); assert.ok(data.detectionRange>0); assert.notDeepEqual(data.collision,data.visual);
});

test("proyectiles expiran y se eliminan fuera del nivel", () => {
  const system=new ProjectileSystem(); const item=enemy("robotCannon"); const shot=system.fireCannonBall(item); shot.lifetime=1;
  system.update(3600); assert.equal(system.projectiles.length,0);
});
