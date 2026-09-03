export class GameLoop {
  private frame = 0;
  private running = false;

  constructor(private readonly onFrame: (timestamp: number) => void) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.step(performance.now());
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private step = (timestamp: number) => {
    if (!this.running) return;
    this.onFrame(timestamp);
    this.frame = requestAnimationFrame(this.step);
  };
}
