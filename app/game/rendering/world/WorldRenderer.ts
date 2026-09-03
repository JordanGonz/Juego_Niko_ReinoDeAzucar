import type { Biome, RenderState } from "../../types";
import { LegacyBiomeRenderer } from "./LegacyBiomeRenderer.ts";
import { MeadowBiomeRenderer } from "./MeadowBiomeRenderer.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types";

export function selectWorldRendererId(biome:Biome){return biome==="meadow"?"meadow":"legacy";}
export class WorldRenderer{
  private readonly meadow=new MeadowBiomeRenderer();private readonly legacy=new LegacyBiomeRenderer();
  get(view:RenderState):BiomeRenderer{return view.level.biome==="meadow"?this.meadow:this.legacy;}
  context(ctx:CanvasRenderingContext2D,view:RenderState,width:number,height:number):WorldRenderContext{return{ctx,view,width,height};}
}
