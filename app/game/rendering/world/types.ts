import type { Biome, DecorationType, RenderState } from "../../types";

export type ParallaxLayerDefinition={id:string;speed:number};
export type BiomeDefinition={
  id:Biome;name:string;sky:readonly[string,string];
  colors:{far:string;mid:string;near:string;grass:string;grassDark:string;soil:string;soilDark:string;accent:string};
  layers:readonly ParallaxLayerDefinition[];decorationTypes:readonly DecorationType[];ambientParticleCount:number;
};
export type WorldRenderContext={ctx:CanvasRenderingContext2D;view:RenderState;width:number;height:number};
export interface BiomeRenderer{
  readonly id:string;
  renderBackground(context:WorldRenderContext):void;
  renderPlatforms(context:WorldRenderContext):void;
  renderGameplay(context:WorldRenderContext):void;
  renderForeground(context:WorldRenderContext):void;
}
