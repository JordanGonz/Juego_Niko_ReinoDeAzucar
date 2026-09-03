export type AnimationEvent = { frame: number; name: string };

export type AnimationClip = {
  frames: readonly number[];
  frameDuration: number;
  loop: boolean;
  events?: readonly AnimationEvent[];
};
