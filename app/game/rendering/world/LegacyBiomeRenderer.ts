import { FLOOR } from "../../levels.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types";

export class LegacyBiomeRenderer implements BiomeRenderer{
  readonly id="legacy";
  renderBackground({ctx,view,width,height}:WorldRenderContext){
    const level=view.level,sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,level.sky[0]);sky.addColorStop(.48,level.sky[1]);sky.addColorStop(1,level.sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    if(level.biome==="canyon"){
      ctx.fillStyle="rgba(255,218,88,.9)";ctx.beginPath();ctx.arc(760,120,78,0,Math.PI*2);ctx.fill();ctx.fillStyle="#a13e67";
      for(let i=0;i<7;i++){const x=i*260-(view.cameraX*.18%260)-60,h=110+(i%3)*38;ctx.beginPath();ctx.moveTo(x,FLOOR);ctx.lineTo(x+35,FLOOR-h);ctx.lineTo(x+150,FLOOR-h);ctx.lineTo(x+210,FLOOR);ctx.fill();}
    }else if(level.biome==="cave"){
      ctx.fillStyle="#24143d";for(let x=-40;x<width+80;x+=95){const depth=70+((x+120)%4)*22;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+38,depth);ctx.lineTo(x+76,0);ctx.fill();}
    }else{
      const aurora=ctx.createLinearGradient(0,80,width,330);aurora.addColorStop(0,"rgba(70,255,221,0)");aurora.addColorStop(.45,"rgba(70,255,221,.22)");aurora.addColorStop(1,"rgba(255,91,205,0)");ctx.fillStyle=aurora;ctx.fillRect(0,70,width,260);
    }
    ctx.fillStyle=level.biome==="canyon"?"#ff6b35":level.biome==="cave"?"#5a2735":"#17275f";ctx.fillRect(0,FLOOR,width,height-FLOOR);
  }
  renderPlatforms({ctx,view}:WorldRenderContext){
    const palettes={canyon:["#ffd35a","#f29b38","#bc4f48","#702e4d"],cave:["#f08c9d","#ba4c79","#6a3153","#351d3f"],crystal:["#b9fff4","#55d8df","#5262bd","#29265f"]} as const;
    const p=palettes[view.level.biome as keyof typeof palettes]??palettes.crystal;
    view.level.platforms.forEach(([x,y,w,h])=>{const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,p[0]);g.addColorStop(.16,p[1]);g.addColorStop(.17,p[2]);g.addColorStop(1,p[3]);ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();});
  }
  renderGameplay(){}renderForeground(){}
}
