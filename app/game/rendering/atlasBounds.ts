import { explicitAtlasRegion } from "./atlasRegions.ts";
export type SourceRect={x:number;y:number;width:number;height:number};
const cache=new WeakMap<object,Map<string,SourceRect>>();
// Analyze each cell once, ignoring transparent margins and faint glow.
export function atlasBounds(image:CanvasImageSource,columns:number,rows:number,column:number,row:number):SourceRect{
  const img=image as HTMLImageElement;
  const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  const key=`${columns}:${rows}:${column}:${row}`;
  let entries=cache.get(image);if(!entries){entries=new Map();cache.set(image,entries);}
  const existing=entries.get(key);if(existing)return existing;
  const region=explicitAtlasRegion(img.src??"",column,row,w,h);
  const x=region?.x??Math.ceil(column*w/columns),y=region?.y??Math.ceil(row*h/rows),cw=region?.width??(Math.floor(w/columns)-2),ch=region?.height??(Math.floor(h/rows)-2);
  let result={x,y,width:cw,height:ch};
  if(typeof document!=="undefined"){
    const canvas=document.createElement("canvas");canvas.width=cw;canvas.height=ch;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    if(ctx){ctx.drawImage(image,x,y,cw,ch,0,0,cw,ch);const data=ctx.getImageData(0,0,cw,ch).data;
      let left=cw,top=ch,right=-1,bottom=-1;
      for(let py=0;py<ch;py++)for(let px=0;px<cw;px++)if(data[(py*cw+px)*4+3]>100){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
      if(right>=left)result={x:x+left,y:y+top,width:right-left+1,height:bottom-top+1};
    }
  }
  entries.set(key,result);return result;
}
