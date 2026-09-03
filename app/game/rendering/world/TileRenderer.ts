import type { BiomeDefinition, WorldRenderContext } from "./types";
import { drawAtlasCell, isVisibleInCamera, MEADOW_ASSETS } from "./meadowAssets.ts";

export function classifyPlatform(width:number,height:number,y:number){
  if(y>=450)return"ground";if(width<=145)return"isolated";if(width<220)return"short";return height>55?"long":"elevated";
}

export class TileRenderer{
  render({ctx,view,assets,width:viewportWidth}:WorldRenderContext,biome:BiomeDefinition){
    const atlas=assets.get(MEADOW_ASSETS.tiles.id);
    view.level.platforms.forEach(([x,y,width,height],platformIndex)=>{
      if(!isVisibleInCamera(x,width,view.cameraX,viewportWidth))return;
      const style=classifyPlatform(width,height,y);
      if(atlas){
        const column=style==="ground"?1:style==="isolated"?3:style==="short"?0:2;
        ctx.save();ctx.shadowColor="rgba(47,35,53,.2)";ctx.shadowBlur=12;ctx.shadowOffsetY=7;
        drawAtlasCell(ctx,atlas,{column,row:0},4,1,x-18,y-52,width+36,Math.max(112,height+88));ctx.restore();return;
      }
      ctx.save();ctx.shadowColor="rgba(47,35,53,.22)";ctx.shadowBlur=14;ctx.shadowOffsetY=9;
      ctx.fillStyle=biome.colors.soilDark;ctx.beginPath();ctx.roundRect(x-3,y+3,width+6,height+8,style==="ground"?12:15);ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle=biome.colors.soil;ctx.beginPath();ctx.roundRect(x,y,width,height,style==="ground"?10:14);ctx.fill();
      ctx.fillStyle="rgba(112,58,51,.32)";
      for(let px=x+22;px<x+width-8;px+=48){const py=y+24+((px+platformIndex*17)%Math.max(18,height-28));ctx.beginPath();ctx.ellipse(px,py,7,4,.2,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle="rgba(86,52,52,.32)";ctx.lineWidth=3;
      for(let px=x+38;px<x+width-20;px+=95){ctx.beginPath();ctx.moveTo(px,y+18);ctx.bezierCurveTo(px-7,y+34,px+8,y+43,px,y+Math.min(height-5,62));ctx.stroke();}
      ctx.fillStyle=biome.colors.grassDark;ctx.beginPath();ctx.roundRect(x-5,y-3,width+10,14,8);ctx.fill();
      ctx.fillStyle=biome.colors.grass;
      for(let px=x-2;px<x+width;px+=13){const lift=((px+platformIndex*7)%3)*2;ctx.beginPath();ctx.ellipse(px+7,y+3-lift,9,7,0,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#b6ed63";ctx.fillRect(x+5,y-5,Math.max(0,width-10),4);ctx.restore();
    });
  }
}
