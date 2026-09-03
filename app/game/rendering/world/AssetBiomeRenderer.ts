import { FLOOR } from "../../levels.ts";
import type { Biome } from "../../types.ts";
import { WORLD_ASSETS } from "../../assets/gameAssets.ts";
import { LegacyBiomeRenderer } from "./LegacyBiomeRenderer.ts";
import { drawAtlasCell, isVisibleInCamera } from "./meadowAssets.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types.ts";

const AMBIENT:Record<Exclude<Biome,"meadow">,{color:string;accent:string}>={
  canyon:{color:"#ffb347",accent:"#ff6338"},cave:{color:"#6ff7ff",accent:"#e874ff"},crystal:{color:"#fff8c7",accent:"#8ceaff"},
};

function cover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,width:number,height:number){
  const target=width/height,ratio=image.naturalWidth/image.naturalHeight;
  const sw=ratio>target?image.naturalHeight*target:image.naturalWidth,sh=ratio>target?image.naturalHeight:image.naturalWidth/target;
  ctx.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,0,0,width,height);
}

export class AssetBiomeRenderer implements BiomeRenderer{
  readonly id:string;private readonly legacy=new LegacyBiomeRenderer();
  constructor(private readonly biome:Exclude<Biome,"meadow">){this.id=`${biome}-assets`;}
  renderBackground(context:WorldRenderContext){
    const {ctx,assets,width,height,view}=context,set=WORLD_ASSETS[this.biome],far=assets.get(set.far.id),mid=assets.get(set.mid.id);
    if(far)cover(ctx,far,width,height);else this.legacy.renderBackground(context);
    if(mid){const drawWidth=Math.max(width*1.55,mid.naturalWidth*(height*.58/mid.naturalHeight)),drawHeight=height*.58,offset=-(view.cameraX*.23%drawWidth);ctx.save();ctx.globalAlpha=.82;ctx.drawImage(mid,offset,FLOOR-drawHeight+30,drawWidth,drawHeight);ctx.drawImage(mid,offset+drawWidth,FLOOR-drawHeight+30,drawWidth,drawHeight);ctx.restore();}
    const palette=AMBIENT[this.biome];for(let i=0;i<12;i++){const x=(i*193+view.tick*(i%3+1)*.18)%width,y=70+(i*79)%(height-120);ctx.globalAlpha=.18+(i%3)*.1;ctx.fillStyle=i%2?palette.color:palette.accent;ctx.fillRect(x,y,2+(i%2),2+(i%2));}ctx.globalAlpha=1;
  }
  renderPlatforms(context:WorldRenderContext){
    const {ctx,view,assets,width:viewport}=context,atlas=assets.get(WORLD_ASSETS[this.biome].tiles.id);
    if(!atlas){this.legacy.renderPlatforms(context);return;}
    view.level.platforms.forEach(([x,y,w,h])=>{if(!isVisibleInCamera(x,w,view.cameraX,viewport))return;const ground=y>=450,column=ground?(w>500?1:0):(w<=145?3:w<220?0:1),row=ground?0:1;ctx.save();ctx.shadowColor="rgba(16,10,35,.24)";ctx.shadowBlur=12;ctx.shadowOffsetY=8;drawAtlasCell(ctx,atlas,{column,row},4,2,x-18,y-48,w+36,Math.max(105,h+82));ctx.restore();});
  }
  renderGameplay({ctx,view,assets,width}:WorldRenderContext){
    const set=WORLD_ASSETS[this.biome],decor=assets.get(set.decorations.id),gameplay=assets.get(set.gameplay.id);
    if(decor)view.level.platforms.forEach(([x,y,w],index)=>{if(index>7||!isVisibleInCamera(x,w,view.cameraX,width))return;const column=index%4,row=index%2;const size=index%3===0?92:70;ctx.save();ctx.globalAlpha=.84;drawAtlasCell(ctx,decor,{column,row},4,2,x+w*(.22+(index%3)*.25)-size/2,y-size,size,size);ctx.restore();});
    if(gameplay){view.checkpoints.forEach((item)=>{if(isVisibleInCamera(item.x,90,view.cameraX,width))drawAtlasCell(ctx,gameplay,{column:item.activated?1:0,row:0},4,2,item.x-48,item.y-42,100,100);});view.hazards.forEach((item)=>{if(isVisibleInCamera(item.x,item.width,view.cameraX,width))drawAtlasCell(ctx,gameplay,{column:2,row:0},4,2,item.x-10,item.y-44,item.width+20,68);});}
  }
  renderForeground({ctx,view,assets,width}:WorldRenderContext){
    const image=assets.get(WORLD_ASSETS[this.biome].decorations.id);if(!image)return;
    ctx.save();ctx.translate(-view.cameraX*.1,0);ctx.globalAlpha=.28;const positions=[view.cameraX*1.1-80,view.cameraX*1.1+width-20];positions.forEach((x,index)=>drawAtlasCell(ctx,image,{column:index?3:0,row:1},4,2,x,FLOOR-30,index?150:120,135));ctx.restore();
  }
}
