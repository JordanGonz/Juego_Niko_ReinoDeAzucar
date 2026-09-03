import type { PickupType, Rect } from "../types";

export function coinBounds(x:number,y:number):Rect{return{x:x-14,y:y-14,width:28,height:28};}
export function pickupBounds(x:number,y:number,type:PickupType):Rect{
  const size=type==="heart"?36:38;return{x:x-size/2,y:y-size/2,width:size,height:size};
}
