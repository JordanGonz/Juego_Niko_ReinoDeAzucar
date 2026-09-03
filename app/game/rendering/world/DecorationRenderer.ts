import type { DecorationSeed, Level } from "../../types";

function circle(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
export function resolveDecorationY(item:DecorationSeed,level:Level){return item.platformIndex===undefined?(item.y??458):level.platforms[item.platformIndex][1];}

export class DecorationRenderer{
  render(ctx:CanvasRenderingContext2D,level:Level,item:DecorationSeed,tick:number){
    const y=resolveDecorationY(item,level),s=item.scale??1,v=item.variant??0;ctx.save();ctx.translate(item.x,y);
    if(item.type==="grass"||item.type==="tree")ctx.rotate(Math.sin(tick*.025+item.x*.01)*.008);
    ctx.scale(s,s);
    if(item.type==="tree"){
      ctx.fillStyle="#92543d";ctx.beginPath();ctx.roundRect(-10,-86,20,88,9);ctx.fill();ctx.fillStyle="#b96b48";ctx.fillRect(-4,-78,5,68);
      circle(ctx,-24,-93,29,v%2?"#52bb70":"#45ad68");circle(ctx,18,-101,34,v%3?"#62ca73":"#55bd69");circle(ctx,0,-125,31,"#70d67b");circle(ctx,-7,-135,10,"rgba(255,255,180,.22)");
    }else if(item.type==="bush"){
      circle(ctx,-17,-10,16,"#319b58");circle(ctx,1,-15,21,"#49b967");circle(ctx,22,-10,15,"#5aca70");
    }else if(item.type==="flowerPatch"){
      const colors=["#ff719f","#b46deb","#ffd553"];for(let i=0;i<5;i++){const x=-18+i*9;ctx.strokeStyle="#278e50";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,-12-(i%2)*5);ctx.stroke();circle(ctx,x,-14-(i%2)*5,4,colors[(i+v)%3]);circle(ctx,x,-14-(i%2)*5,1.5,"#fff3a1");}
    }else if(item.type==="rock"){
      ctx.fillStyle="#786b85";ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-13,-17);ctx.lineTo(5,-24);ctx.lineTo(20,-11);ctx.lineTo(16,0);ctx.closePath();ctx.fill();ctx.fillStyle="#9b91a7";ctx.beginPath();ctx.moveTo(-11,-16);ctx.lineTo(4,-20);ctx.lineTo(10,-11);ctx.lineTo(-5,-9);ctx.fill();
    }else if(item.type==="mushroom"){
      ctx.fillStyle="#f7d9b8";ctx.beginPath();ctx.roundRect(-4,-13,8,14,3);ctx.fill();circle(ctx,0,-15,11,"#b864dc");circle(ctx,-4,-18,2,"#fff2cf");
    }else{
      ctx.strokeStyle="#36a75d";ctx.lineWidth=3;for(let i=-18;i<=18;i+=7){ctx.beginPath();ctx.moveTo(i,0);ctx.quadraticCurveTo(i-3,-15-(i%3)*3,i+2,-24);ctx.stroke();}
    }
    ctx.restore();
  }
  renderLayer(ctx:CanvasRenderingContext2D,level:Level,layer:DecorationSeed["layer"],tick:number){
    (level.decorations??[]).filter((item)=>item.layer===layer).forEach((item)=>this.render(ctx,level,item,tick));
  }
}
