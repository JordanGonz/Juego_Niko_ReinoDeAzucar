import type { Biome, RenderState } from "../../types";
import { LegacyBiomeRenderer } from "./LegacyBiomeRenderer.ts";
import { MeadowBiomeRenderer } from "./MeadowBiomeRenderer.ts";
import type { BiomeRenderer, WorldRenderContext } from "./types";
import type { AssetManager } from "../../assets/AssetManager.ts";
import { AssetBiomeRenderer } from "./AssetBiomeRenderer.ts";

export function selectWorldRendererId(biome:Biome){return biome==="meadow"?"meadow":`${biome}-assets`;}
export class WorldRenderer{
  private readonly meadow=new MeadowBiomeRenderer();private readonly legacy=new LegacyBiomeRenderer();
  private readonly worlds={canyon:new AssetBiomeRenderer("canyon"),cave:new AssetBiomeRenderer("cave"),crystal:new AssetBiomeRenderer("crystal")};
  get(view:RenderState):BiomeRenderer{return view.level.biome==="meadow"?this.meadow:this.worlds[view.level.biome]??this.legacy;}
  context(ctx:CanvasRenderingContext2D,view:RenderState,width:number,height:number,assets:AssetManager):WorldRenderContext{return{ctx,view,width,height,assets};}
}
