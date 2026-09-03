import { FLOOR } from "../../levels.ts";
import { calculateParallaxOffset, repeatPosition } from "./ParallaxLayer.ts";
import { DecorationRenderer } from "./DecorationRenderer.ts";
import { TileRenderer } from "./TileRenderer.ts";
import { MEADOW_BIOME } from "./biomes/meadow.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types";

function cloud(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,alpha:number){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=alpha;ctx.fillStyle="#fff";ctx.beginPath();
  ctx.moveTo(-45,10);ctx.bezierCurveTo(-51,-5,-37,-17,-22,-13);ctx.bezierCurveTo(-15,-37,20,-39,28,-13);ctx.bezierCurveTo(51,-17,61,3,49,16);ctx.bezierCurveTo(27,25,-29,25,-45,10);ctx.fill();ctx.restore();
}
function hill(ctx:CanvasRenderingContext2D,x:number,y:number,width:number,height:number,color:string){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+width*.18,y-height*.92,x+width*.36,y-height,x+width*.5,y-height*.78);ctx.bezierCurveTo(x+width*.66,y-height*1.06,x+width*.88,y-height*.74,x+width,y);ctx.closePath();ctx.fill();
}
function spike(ctx:CanvasRenderingContext2D,x:number,y:number,width:number){
  const count=Math.max(2,Math.round(width/16)),step=width/count;ctx.fillStyle="#704566";ctx.strokeStyle="#fff4dc";ctx.lineWidth=2;
  for(let i=0;i<count;i++){ctx.beginPath();ctx.moveTo(x+i*step,y+18);ctx.lineTo(x+i*step+step/2,y);ctx.lineTo(x+(i+1)*step,y+18);ctx.closePath();ctx.fill();ctx.stroke();}
}

export class MeadowBiomeRenderer implements BiomeRenderer{
  readonly id="meadow";private readonly tiles=new TileRenderer();private readonly decorations=new DecorationRenderer();
  private skyGradient:CanvasGradient|null=null;private sunGradient:CanvasGradient|null=null;private gradientWidth=0;private gradientHeight=0;
  renderBackground({ctx,view,width,height}:WorldRenderContext){
    if(!this.skyGradient||this.gradientWidth!==width||this.gradientHeight!==height){
      this.skyGradient=ctx.createLinearGradient(0,0,0,height);this.skyGradient.addColorStop(0,MEADOW_BIOME.sky[0]);this.skyGradient.addColorStop(.72,MEADOW_BIOME.sky[1]);this.skyGradient.addColorStop(1,"#f5f1b7");
      this.sunGradient=ctx.createRadialGradient(width*.78,82,6,width*.78,82,74);this.sunGradient.addColorStop(0,"rgba(255,249,188,.95)");this.sunGradient.addColorStop(1,"rgba(255,238,143,0)");this.gradientWidth=width;this.gradientHeight=height;
    }
    ctx.fillStyle=this.skyGradient;ctx.fillRect(0,0,width,height);ctx.fillStyle=this.sunGradient!;ctx.fillRect(0,0,width,190);
    const far=calculateParallaxOffset(view.cameraX,.1);for(let i=0;i<7;i++){const x=repeatPosition(-150,250,i,far,1750);hill(ctx,x,FLOOR+8,310,185+(i%3)*18,MEADOW_BIOME.colors.far);}
    const mid=calculateParallaxOffset(view.cameraX,.23);for(let i=0;i<7;i++){const x=repeatPosition(-180,285,i,mid,1995);hill(ctx,x,FLOOR+12,360,135+(i%2)*28,MEADOW_BIOME.colors.mid);}
    for(let i=0;i<8;i++)cloud(ctx,repeatPosition(-80,220,i,calculateParallaxOffset(view.cameraX,i%2?.08:.14),1760),65+(i%3)*55,.62+(i%2)*.2,.55+(i%3)*.12);
    ctx.save();ctx.translate(calculateParallaxOffset(view.cameraX,.23),0);this.decorations.renderLayer(ctx,view.level,"backgroundMid",view.tick);ctx.restore();
    ctx.save();ctx.translate(calculateParallaxOffset(view.cameraX,.42),0);this.decorations.renderLayer(ctx,view.level,"backgroundNear",view.tick);ctx.restore();
    ctx.fillStyle="rgba(42,127,83,.34)";ctx.fillRect(0,FLOOR,width,height-FLOOR);
    this.renderAmbient(ctx,view.tick,width,height);
  }
  renderPlatforms(context:WorldRenderContext){this.tiles.render(context,MEADOW_BIOME);}
  renderGameplay({ctx,view}:WorldRenderContext){
    this.decorations.renderLayer(ctx,view.level,"gameplay",view.tick);
    view.checkpoints.forEach((checkpoint)=>{
      ctx.save();ctx.translate(checkpoint.x,checkpoint.y);ctx.shadowColor=checkpoint.activated?"#ffe25a":"rgba(40,30,70,.25)";ctx.shadowBlur=checkpoint.activated?18:5;
      ctx.fillStyle="#e0b447";ctx.fillRect(-3,0,6,58);ctx.fillStyle=checkpoint.activated?"#22cbbd":"#5a93a2";ctx.beginPath();ctx.moveTo(3,5);ctx.quadraticCurveTo(25,11,38,3);ctx.lineTo(38,26);ctx.quadraticCurveTo(23,32,3,24);ctx.closePath();ctx.fill();
      ctx.fillStyle="#ffe35b";ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?4:9;ctx.lineTo(20+Math.cos(a)*r,15+Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.restore();
    });
    view.hazards.forEach((hazard)=>spike(ctx,hazard.x,hazard.y,hazard.width));
  }
  renderForeground({ctx,view}:WorldRenderContext){
    ctx.save();ctx.translate(-view.cameraX*.1,0);ctx.globalAlpha=.68;this.decorations.renderLayer(ctx,view.level,"foreground",view.tick);ctx.restore();
  }
  private renderAmbient(ctx:CanvasRenderingContext2D,tick:number,width:number,height:number){
    for(let i=0;i<MEADOW_BIOME.ambientParticleCount;i++){const x=(i*127+tick*(i%3+1)*.08)%width,y=70+(i*83)%Math.max(120,height-170)+Math.sin(tick*.018+i)*7;ctx.globalAlpha=.18+(i%4)*.07;ctx.fillStyle=i%3?"#fffbd0":"#ffd0e7";ctx.beginPath();ctx.arc(x,y,1.4+(i%2),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  }
}
