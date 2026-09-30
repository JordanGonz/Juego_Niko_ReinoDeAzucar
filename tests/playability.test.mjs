import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, FLOOR } from '../app/game/levels.ts';
import { movementForLevel } from '../app/game/physics/tuning.ts';
import { applyGravity } from '../app/game/physics/playerMovement.ts';
import { createPlayer } from '../app/game/entities/Player.ts';
import { createEnemies } from '../app/game/enemies/factory.ts';
import { attackHits } from '../app/game/systems/AttackSystem.ts';

test('la ruta principal es alcanzable con salto normal y la ruta alta pide volver con salto doble',()=>{
  for(const level of LEVELS){
    const config=movementForLevel(level),edges=level.platforms.map(()=>[]);
    level.platforms.forEach((from,i)=>level.platforms.forEach((to,j)=>{
      if(i===j)return;let y=from[1],vy=-config.jumpVelocity;
      for(let frame=1;frame<100;frame++){
        const previous=y;vy=applyGravity(vy,config);y+=vy;
        if(vy>0&&previous<=to[1]&&y>=to[1]){
          const gap=Math.max(0,to[0]-(from[0]+from[2]),from[0]-(to[0]+to[2]));
          if(gap+30<frame*config.maxRunSpeed)edges[i].push(j);break;
        }
      }
    }));
    const reached=new Set([0]),queue=[0];while(queue.length){for(const next of edges[queue.shift()])if(!reached.has(next)){reached.add(next);queue.push(next);}}
    const secret = level.biome === 'meadow' ? level.platforms.length - 1 : -1;
    assert.equal(reached.size,level.platforms.length-(secret >= 0 ? 1 : 0),level.name+' tiene plataforma inaccesible');
    if (secret >= 0) {
      assert.equal(reached.has(secret),false);
      const from = level.platforms[13], to = level.platforms[secret];
      let y = from[1], vy = -config.jumpVelocity, jumpedTwice = false, landed = false;
      for (let frame = 0; frame < 120; frame++) {
        if (!jumpedTwice && vy >= 0) { vy = -config.jumpVelocity * .9; jumpedTwice = true; }
        const previous = y; vy = applyGravity(vy, config); y += vy;
        if (jumpedTwice && vy > 0 && previous <= to[1] && y >= to[1]) { landed = true; break; }
      }
      assert.equal(landed,true,'la ruta alta debe poder alcanzarse al regresar');
    }
    assert.equal(level.platforms[0][1],FLOOR);
  }
});
test('espada respeta dirección, distancia, altura e intangibilidad',()=>{
  const player=createPlayer(),enemy=createEnemies(LEVELS[0])[0];enemy.x=player.x+48;enemy.y=player.y;enemy.contactEnabled=true;
  assert.equal(attackHits(player,enemy),true);player.facing=-1;assert.equal(attackHits(player,enemy),false);
  player.facing=1;enemy.x+=150;assert.equal(attackHits(player,enemy),false);
  enemy.x=player.x+48;enemy.contactEnabled=false;assert.equal(attackHits(player,enemy),false);
  enemy.contactEnabled=true;enemy.y-=120;assert.equal(attackHits(player,enemy),false);
});
