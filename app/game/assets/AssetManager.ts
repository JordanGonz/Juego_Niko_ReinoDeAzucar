export type ImageFactory = () => HTMLImageElement;

export class AssetManager {
  private readonly resources=new Map<string,HTMLImageElement>();
  private readonly pending=new Map<string,Promise<HTMLImageElement>>();
  private readonly makeImage:ImageFactory;
  constructor(makeImage:ImageFactory=()=>new Image()){this.makeImage=makeImage;}

  load(id:string,src:string) {
    const ready=this.resources.get(id); if(ready) return Promise.resolve(ready);
    const existing=this.pending.get(id); if(existing) return existing;
    const image=this.makeImage();
    const request=new Promise<HTMLImageElement>((resolve,reject)=>{
      image.onload=()=>{this.resources.set(id,image);this.pending.delete(id);resolve(image);};
      image.onerror=()=>{this.pending.delete(id);reject(new Error(`No se pudo cargar ${id}`));};
      image.src=src;
    });
    this.pending.set(id,request);return request;
  }
  get(id:string){return this.resources.get(id)??null;}
  has(id:string){return this.resources.has(id);}
  get isLoading(){return this.pending.size>0;}
}
