export const FIXED_UPDATE_RATE = 60;
export const FIXED_STEP_MS = 1000 / FIXED_UPDATE_RATE;
export const FIXED_STEP_SECONDS = 1 / FIXED_UPDATE_RATE;
export const MAX_STEPS_PER_FRAME = 5;

export function consumeFixedSteps(accumulator: number, deltaMs: number, stepMs = FIXED_STEP_MS, maxSteps = MAX_STEPS_PER_FRAME) {
  let remaining = accumulator + Math.min(deltaMs, stepMs * maxSteps);
  let steps = 0;
  while (remaining + Number.EPSILON * 100 >= stepMs && steps < maxSteps) {
    remaining -= stepMs;
    steps++;
  }
  if (steps === maxSteps && remaining >= stepMs) remaining %= stepMs;
  return { steps, accumulator: remaining };
}

export class GameLoop {
  private frame = 0;
  private running = false;
  private previousTime = 0;
  private accumulator = 0;
  private readonly onUpdate: (stepSeconds: number) => void;
  private readonly onRender: (timestamp: number) => void;

  constructor(
    onUpdate: (stepSeconds: number) => void,
    onRender: (timestamp: number) => void,
  ) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.previousTime = performance.now();
    this.onRender(this.previousTime);
    this.frame = requestAnimationFrame(this.step);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private step = (timestamp: number) => {
    if (!this.running) return;
    const result = consumeFixedSteps(this.accumulator, timestamp - this.previousTime);
    this.previousTime = timestamp;
    this.accumulator = result.accumulator;
    for (let index = 0; index < result.steps; index++) this.onUpdate(FIXED_STEP_SECONDS);
    this.onRender(timestamp);
    this.frame = requestAnimationFrame(this.step);
  };
}
