export type ImageFactory = () => HTMLImageElement;
export type AssetDefinition = Readonly<{ id: string; src: string }>;

export class AssetManager {
  private readonly resources=new Map<string,HTMLImageElement>();
  private readonly pending=new Map<string,Promise<HTMLImageElement>>();
  private readonly requested=new Set<string>();
  private readonly failed=new Map<string,Error>();
  private readonly makeImage:ImageFactory;
  constructor(makeImage:ImageFactory=()=>new Image()){this.makeImage=makeImage;}

  load(id:string,src:string) {
    this.requested.add(id);this.failed.delete(id);
    const ready=this.resources.get(id); if(ready) return Promise.resolve(ready);
    const existing=this.pending.get(id); if(existing) return existing;
    const image=this.makeImage();
    const request=new Promise<HTMLImageElement>((resolve,reject)=>{
      image.onload=()=>{this.resources.set(id,image);this.pending.delete(id);resolve(image);};
      image.onerror=()=>{const error=new Error(`No se pudo cargar ${id}`);this.pending.delete(id);this.failed.set(id,error);reject(error);};
      image.src=src;
    });
    this.pending.set(id,request);return request;
  }
  preload(assets:readonly AssetDefinition[]){
    return Promise.allSettled(assets.map(({id,src})=>this.load(id,src)));
  }
  get(id:string){return this.resources.get(id)??null;}
  has(id:string){return this.resources.has(id);}
  get isLoading(){return this.pending.size>0;}
  get progress(){return this.requested.size===0?1:(this.resources.size+this.failed.size)/this.requested.size;}
  get errors(){return [...this.failed.values()];}
  release(ids:readonly string[]){ids.forEach((id)=>{this.resources.delete(id);this.failed.delete(id);this.requested.delete(id);});}
}
