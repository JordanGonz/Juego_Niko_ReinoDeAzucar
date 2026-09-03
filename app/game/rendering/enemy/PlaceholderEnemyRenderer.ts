import type { EnemyRenderer, EnemyRenderContext } from "./EnemyRenderer.ts";

function ellipse(ctx:CanvasRenderingContext2D, x:number, y:number, rx:number, ry:number, color:string) {
  ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
}
function eye(ctx:CanvasRenderingContext2D, x:number, y:number) { ellipse(ctx,x,y,3.8,5,"#fff"); ellipse(ctx,x+1,y+1,1.5,2,"#241047"); }

export class PlaceholderEnemyRenderer implements EnemyRenderer {
  render({ ctx, enemy, tick }: EnemyRenderContext) {
    const b=enemy.visualBounds, w=b.width, h=b.height;
    const moving = enemy.state === "attack" || enemy.state === "airborne";
    const squash = enemy.state === "anticipate" ? 0.82 : enemy.state === "land" ? 0.72 : 1;
    const bob = moving ? Math.sin(tick*.35)*2 : Math.sin(tick*.08+enemy.x)*1.2;
    ctx.save(); ctx.globalAlpha=enemy.opacity;
    ctx.translate(enemy.x+b.offsetX+w/2,enemy.y+b.offsetY+h/2+bob); ctx.scale(enemy.facing,squash);
    if(enemy.type==="blobHopper") { ellipse(ctx,0,3,w*.46,h*.42,"#a43de0"); eye(ctx,-8,-3); eye(ctx,6,-3); }
    else if(enemy.type==="spikeBeetle") { ellipse(ctx,0,4,w*.46,h*.34,"#6d2d9d"); for(let x=-15;x<=15;x+=10){ctx.fillStyle="#ffc93d";ctx.beginPath();ctx.moveTo(x,-8);ctx.lineTo(x+5,-18);ctx.lineTo(x+9,-7);ctx.fill();} eye(ctx,8,0); }
    else if(enemy.type==="roundBat") { ellipse(ctx,0,2,w*.3,h*.38,"#663092"); ctx.fillStyle="#d54c9c";ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-w*.5,-14);ctx.lineTo(-w*.42,12);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(w*.5,-14);ctx.lineTo(w*.42,12);ctx.closePath();ctx.fill();eye(ctx,-5,-3);eye(ctx,5,-3); }
    else if(enemy.type==="stealthGhost") { ellipse(ctx,0,-1,w*.44,h*.42,"#43d6ca"); ctx.fillRect(-w*.44,-1,w*.88,h*.34); eye(ctx,-7,-5);eye(ctx,7,-5); }
    else if(enemy.type==="bitePlant") { ctx.fillStyle="#39a94d";ctx.fillRect(-4,7,8,h*.35);ellipse(ctx,-9,13,12,5,"#55c75e");ellipse(ctx,9,13,12,5,"#55c75e");ellipse(ctx,0,-7,w*.4,h*.31,"#ed4f91");ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-13,-7);ctx.lineTo(13,-7);ctx.stroke(); }
    else if(enemy.type==="robotCannon") { ctx.fillStyle="#20bfc2";ctx.roundRect(-w*.42,-h*.25,w*.7,h*.55,8);ctx.fill();ctx.fillStyle="#ffc83d";ctx.fillRect(-w*.5,-7,w*.58,13);ellipse(ctx,8,0,7,7,"#1b315c"); }
    else if(enemy.type==="maskedBandit") { ellipse(ctx,0,5,w*.36,h*.42,"#23bfc2");ellipse(ctx,0,-8,w*.35,h*.24,"#301751");ctx.fillStyle="#ffc83d";ctx.fillRect(-w*.38,-14,w*.76,6);eye(ctx,7,-7); }
    else { ellipse(ctx,0,1,w*.45,h*.45,"#625a70");ctx.strokeStyle="#898094";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#ffc83d";ctx.beginPath();ctx.moveTo(-5,-h*.43);ctx.lineTo(6,-h*.43);ctx.lineTo(10,-h*.25);ctx.lineTo(-9,-h*.25);ctx.fill();eye(ctx,8,-2); }
    ctx.restore();
  }
}
