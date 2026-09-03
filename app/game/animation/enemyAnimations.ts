import type { EnemyState, RuntimeEnemy } from "../types";
import type { AnimationClip } from "./AnimationClip";

export const ENEMY_ANIMATION_CLIPS: Record<EnemyState, AnimationClip> = {
  idle:{frames:[0,1,2,1],frameDuration:8,loop:true}, patrol:{frames:[0,1,2,3,4,5],frameDuration:6,loop:true},
  alert:{frames:[0,1],frameDuration:6,loop:true}, anticipate:{frames:[0,1,2],frameDuration:7,loop:false},
  airborne:{frames:[0,1],frameDuration:7,loop:true}, land:{frames:[0,1],frameDuration:5,loop:false,events:[{frame:1,name:"land"}]},
  attack:{frames:[0,1,2,3,4,5],frameDuration:5,loop:true,events:[{frame:3,name:"attack"}]},
  phase:{frames:[0,1,2,3],frameDuration:9,loop:true}, recover:{frames:[0,1,2],frameDuration:8,loop:false},
  cooldown:{frames:[0,1,2,3],frameDuration:9,loop:true}, hurt:{frames:[0,1],frameDuration:4,loop:false},
  defeated:{frames:[0],frameDuration:1,loop:false},
};

export function updateEnemyAnimation(enemy: RuntimeEnemy) {
  enemy.animationState = enemy.state;
  enemy.animationTimer++;
  const clip = ENEMY_ANIMATION_CLIPS[enemy.animationState];
  const cursor = Math.floor(enemy.animationTimer / clip.frameDuration);
  const index = clip.loop ? cursor % clip.frames.length : Math.min(cursor, clip.frames.length - 1);
  enemy.animationFrame = clip.frames[index] ?? 0;
}
