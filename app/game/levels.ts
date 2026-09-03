import type { Level } from "./types";

export const FLOOR = 458;
export const GRAVITY = 0.75;
export const PLAYER_WIDTH = 38;
export const PLAYER_HEIGHT = 50;
export const MAX_LIVES = 5;
export const PROGRESS_KEY = "niko-unlocked-world";

export const LEVELS: readonly Level[] = [
  {
    name: "Pradera de Gomitas", mission: "Corre por las colinas y recupera las estrellas de azúcar.",
    width: 3600, biome: "meadow", friction: 0.78, jumpForce: 13.8,
    sky: ["#7657ff", "#fc7dc9", "#ffd887"],
    platforms: [
      [0, FLOOR, 690, 82], [810, FLOOR, 620, 82], [1560, FLOOR, 550, 82],
      [2250, FLOOR, 650, 82], [3040, FLOOR, 560, 82], [330, 350, 165, 28],
      [570, 276, 145, 28], [920, 352, 170, 28], [1190, 276, 150, 28],
      [1650, 345, 160, 28], [1920, 265, 165, 28], [2350, 342, 180, 28],
      [2650, 267, 170, 28], [3130, 335, 180, 28],
    ],
    coins: [[380,305],[455,305],[610,230],[665,230],[965,307],[1230,230],[1290,230],[1700,300],[1970,218],[2035,218],[2410,296],[2490,296],[2700,220],[2770,220],[3185,288],[3270,288],[3400,395]],
    pickups: [[1330,410,"heart"],[2010,215,"shield"],[2760,217,"boost"]],
    enemies: [
      { type:"blobHopper", x:560, platformIndex:0 }, { type:"spikeBeetle", x:1040, platformIndex:1, facing:-1 },
      { type:"blobHopper", x:1780, platformIndex:2 }, { type:"bitePlant", x:2500, platformIndex:3 },
      { type:"maskedBandit", x:3260, platformIndex:4, facing:-1 },
    ],
    decorations: [
      {type:"tree",x:210,y:418,layer:"backgroundNear",scale:1.05,variant:0},
      {type:"tree",x:760,y:432,layer:"backgroundMid",scale:.78,variant:1},
      {type:"tree",x:1480,y:430,layer:"backgroundMid",scale:.9,variant:2},
      {type:"tree",x:2180,y:432,layer:"backgroundNear",scale:1.08,variant:1},
      {type:"tree",x:2960,y:430,layer:"backgroundMid",scale:.82,variant:0},
      {type:"bush",x:250,platformIndex:0,layer:"gameplay",scale:.9},{type:"flowerPatch",x:420,platformIndex:0,layer:"gameplay",variant:0},
      {type:"rock",x:850,platformIndex:1,layer:"gameplay",scale:.8},{type:"flowerPatch",x:1130,platformIndex:1,layer:"gameplay",variant:1},
      {type:"bush",x:1600,platformIndex:2,layer:"gameplay"},{type:"mushroom",x:2045,platformIndex:2,layer:"gameplay",scale:.8},
      {type:"flowerPatch",x:2300,platformIndex:3,layer:"gameplay",variant:2},{type:"rock",x:2810,platformIndex:3,layer:"gameplay"},
      {type:"bush",x:3070,platformIndex:4,layer:"gameplay",scale:.85},{type:"flowerPatch",x:3425,platformIndex:4,layer:"gameplay",variant:1},
      {type:"grass",x:80,y:520,layer:"foreground",scale:1.2},{type:"flowerPatch",x:690,y:525,layer:"foreground",scale:1.15,variant:2},
      {type:"grass",x:1510,y:520,layer:"foreground",scale:1.3},{type:"bush",x:2230,y:528,layer:"foreground",scale:1.1},
      {type:"flowerPatch",x:3020,y:525,layer:"foreground",scale:1.2,variant:0},
    ],
    checkpoints:[{id:"meadow-mid",x:1700,platformIndex:2}],
    hazards:[{id:"meadow-spikes",type:"spikes",x:1360,platformIndex:1,width:48,damage:1}],
  },
  {
    name: "Cañón de Caramelo", mission: "Salta entre las islas de caramelo sin caer al jarabe.",
    width: 4000, biome: "canyon", friction: 0.68, jumpForce: 14.2,
    sky: ["#30258f", "#f4519d", "#ffb64f"],
    platforms: [
      [0,FLOOR,520,82],[660,FLOOR,430,82],[1240,FLOOR,500,82],[1900,FLOOR,390,82],
      [2460,FLOOR,510,82],[3140,FLOOR,360,82],[3660,FLOOR,340,82],[250,340,150,28],
      [730,315,150,28],[990,230,145,28],[1320,335,150,28],[1580,250,150,28],
      [1970,325,150,28],[2190,240,135,28],[2550,340,160,28],[2820,255,145,28],
      [3200,315,145,28],[3410,225,140,28],[3720,320,150,28],
    ],
    coins: [[290,294],[355,294],[770,268],[1030,183],[1085,183],[1360,288],[1630,203],[1690,203],[2010,278],[2230,193],[2600,294],[2670,294],[2860,208],[3240,268],[3450,178],[3505,178],[3760,273],[3850,395]],
    pickups: [[1035,180,"heart"],[2235,190,"shield"],[3465,175,"boost"]],
    enemies: [
      { type:"rollingRock", x:400, platformIndex:0 }, { type:"spikeBeetle", x:820, platformIndex:1, facing:-1 },
      { type:"robotCannon", x:1450, platformIndex:2 }, { type:"maskedBandit", x:2070, platformIndex:3, facing:-1 },
      { type:"rollingRock", x:2700, platformIndex:4 }, { type:"bitePlant", x:3270, platformIndex:5 },
      { type:"robotCannon", x:3800, platformIndex:6, facing:-1 },
    ],
  },
  {
    name: "Grutas de Chocolate", mission: "Explora la cueva y evita el río de chocolate caliente.",
    width: 4400, biome: "cave", friction: 0.8, jumpForce: 13.4,
    sky: ["#100c2e", "#312058", "#7a3f52"],
    platforms: [
      [0,FLOOR,460,82],[590,FLOOR,440,82],[1170,FLOOR,390,82],[1710,FLOOR,470,82],
      [2340,FLOOR,400,82],[2910,FLOOR,450,82],[3520,FLOOR,360,82],[4030,FLOOR,370,82],
      [210,350,145,28],[620,320,145,28],[880,230,140,28],[1210,345,145,28],
      [1450,255,135,28],[1770,330,150,28],[2040,245,145,28],[2390,330,145,28],
      [2630,235,145,28],[2960,340,150,28],[3230,250,140,28],[3560,325,150,28],
      [3780,225,140,28],[4080,325,150,28],
    ],
    coins: [[250,304],[315,304],[660,274],[920,183],[975,183],[1250,299],[1490,208],[1810,283],[2080,198],[2140,198],[2430,283],[2670,188],[2725,188],[3000,294],[3270,203],[3600,278],[3820,178],[3870,178],[4120,278],[4240,395]],
    pickups: [[1505,205,"heart"],[2685,185,"shield"],[3835,175,"boost"]],
    enemies: [
      { type:"roundBat", x:350, platformIndex:0 }, { type:"stealthGhost", x:760, platformIndex:1, facing:-1 },
      { type:"blobHopper", x:1320, platformIndex:2 }, { type:"bitePlant", x:1900, platformIndex:3 },
      { type:"robotCannon", x:2500, platformIndex:4 }, { type:"stealthGhost", x:3100, platformIndex:5 },
      { type:"roundBat", x:3670, platformIndex:6, facing:-1 }, { type:"maskedBandit", x:4200, platformIndex:7, facing:-1 },
    ],
  },
  {
    name: "Castillo de Cristal", mission: "Cruza el hielo y devuelve la magia a la torre real.",
    width: 4700, biome: "crystal", friction: 0.92, jumpForce: 13.6,
    sky: ["#090d3b", "#3836a7", "#9a71e8"],
    platforms: [
      [0,FLOOR,500,82],[650,FLOOR,420,82],[1220,FLOOR,500,82],[1880,FLOOR,420,82],
      [2470,FLOOR,470,82],[3110,FLOOR,410,82],[3690,FLOOR,400,82],[4240,FLOOR,460,82],
      [220,325,145,28],[690,285,145,28],[950,205,135,28],[1280,335,150,28],
      [1550,245,145,28],[1940,320,145,28],[2180,225,135,28],[2530,325,150,28],
      [2800,235,140,28],[3170,320,150,28],[3420,220,140,28],[3750,310,150,28],
      [4000,210,135,28],[4300,315,160,28],
    ],
    coins: [[265,279],[325,279],[735,239],[990,159],[1040,159],[1325,289],[1595,199],[1985,274],[2220,179],[2270,179],[2575,279],[2840,189],[2890,189],[3215,274],[3460,174],[3795,264],[4040,164],[4090,164],[4350,269],[4520,395]],
    pickups: [[1005,155,"heart"],[2855,185,"shield"],[4055,160,"boost"]],
    enemies: [
      { type:"rollingRock", x:380, platformIndex:0 }, { type:"stealthGhost", x:800, platformIndex:1 },
      { type:"roundBat", x:1420, platformIndex:2 }, { type:"robotCannon", x:2050, platformIndex:3, facing:-1 },
      { type:"spikeBeetle", x:2670, platformIndex:4 }, { type:"maskedBandit", x:3280, platformIndex:5, facing:-1 },
      { type:"bitePlant", x:3830, platformIndex:6 }, { type:"rollingRock", x:4430, platformIndex:7, facing:-1 },
    ],
  },
] as const;
