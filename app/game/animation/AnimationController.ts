import type { AnimationClip } from "./AnimationClip";

export class AnimationController<State extends string> {
  private elapsed = 0;
  private frameCursor = 0;

  constructor(
    private readonly clips: Record<State, AnimationClip>,
    private current: State,
  ) {}

  get state() { return this.current; }
  get frame() { return this.clips[this.current].frames[this.frameCursor] ?? 0; }

  setState(next: State) {
    if (next === this.current) return;
    this.current = next;
    this.elapsed = 0;
    this.frameCursor = 0;
  }

  update(stepSeconds: number, onEvent?: (name: string) => void) {
    const clip = this.clips[this.current];
    this.elapsed += stepSeconds;
    while (this.elapsed >= clip.frameDuration) {
      this.elapsed -= clip.frameDuration;
      const previous = this.frameCursor;
      if (this.frameCursor < clip.frames.length - 1) this.frameCursor++;
      else if (clip.loop) this.frameCursor = 0;
      if (this.frameCursor !== previous) {
        clip.events?.filter((event) => event.frame === this.frameCursor).forEach((event) => onEvent?.(event.name));
      }
    }
  }
}
