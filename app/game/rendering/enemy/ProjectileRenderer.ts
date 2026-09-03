import type { RuntimeProjectile } from "../../types";

export class ProjectileRenderer {
  private image:HTMLImageElement|null=null;
  setSprite(image:HTMLImageElement){this.image=image;}
  render(ctx:CanvasRenderingContext2D, projectile:RuntimeProjectile) {
    const b=projectile.visualBounds;
    ctx.save();ctx.translate(projectile.x+b.offsetX+b.width/2,projectile.y+b.offsetY+b.height/2);
    if(this.image){const frame=Math.floor(projectile.lifetime/6)%3,cell=this.image.naturalWidth/4;ctx.drawImage(this.image,frame*cell,0,cell,this.image.naturalHeight,-b.width*.9,-b.height*.9,b.width*1.8,b.height*1.8);ctx.restore();return;}
    ctx.shadowColor="#75f7e7";ctx.shadowBlur=12;ctx.fillStyle="#25305b";
    ctx.beginPath();ctx.arc(0,0,b.width/2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#75f7e7";ctx.lineWidth=3;ctx.stroke();ctx.restore();
  }
}
