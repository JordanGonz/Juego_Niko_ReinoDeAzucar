export function calculateParallaxOffset(cameraX:number,speed:number){return-cameraX*speed;}
export function repeatPosition(origin:number,spacing:number,index:number,offset:number,totalWidth:number){
  const raw=origin+index*spacing+offset;return((raw%totalWidth)+totalWidth)%totalWidth-spacing;
}
