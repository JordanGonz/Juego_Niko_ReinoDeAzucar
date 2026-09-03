import type { BiomeDefinition } from "../types";

export const MEADOW_BIOME:BiomeDefinition={
  id:"meadow",name:"Pradera Brillante",sky:["#65cffa","#d9f8ff"],
  colors:{far:"#acdcb7",mid:"#76c997",near:"#43ad70",grass:"#69dc69",grassDark:"#2da85a",soil:"#a66042",soilDark:"#623a3e",accent:"#ffd447"},
  layers:[{id:"backgroundFar",speed:.1},{id:"backgroundMid",speed:.23},{id:"backgroundNear",speed:.42},{id:"gameplay",speed:1},{id:"foreground",speed:1.1}],
  decorationTypes:["flowerPatch","bush","tree","rock","grass","mushroom"],ambientParticleCount:18,
};
