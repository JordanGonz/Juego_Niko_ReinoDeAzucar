import { collisionRect } from "../entities/Player.ts";
import type { Level, Player, RuntimeHazard } from "../types";

export function createHazards(level:Level):RuntimeHazard[] {
  return (level.hazards ?? []).map((seed)=>{
    const [,platformY]=level.platforms[seed.platformIndex];
    return {id:seed.id,type:seed.type,x:seed.x,y:platformY-18,width:seed.width,height:18,damage:seed.damage};
  });
}

export function hazardHitsPlayer(hazard:RuntimeHazard,player:Player) {
  const body=collisionRect(player);
  return body.x+body.width>hazard.x && body.x<hazard.x+hazard.width && body.y+body.height>hazard.y && body.y<hazard.y+hazard.height;
}

export function damagePlayerFromHazard(player:Player,hazard:RuntimeHazard) {
  player.inv=100;player.vy=-9;player.vx=player.x<hazard.x?-6:6;
  return hazard.damage;
}
