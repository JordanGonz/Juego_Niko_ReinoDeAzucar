export class Camera {
  x = 0;
  private lookAhead = 0;
  private shakeStrength = 0;
  private shakeTimer = 0;
  private shakeX = 0;

  get renderX() { return this.x + this.shakeX; }

  reset() {
    this.x = 0; this.lookAhead = 0; this.shakeStrength = 0; this.shakeTimer = 0; this.shakeX = 0;
  }

  follow(playerX: number, velocityX: number, levelWidth: number, viewportWidth: number) {
    const desiredLookAhead = Math.max(-54, Math.min(54, velocityX * 8));
    this.lookAhead += (desiredLookAhead - this.lookAhead) * 0.08;
    this.x += ((playerX - 280 + this.lookAhead) - this.x) * 0.08;
    this.x = Camera.clamp(this.x, levelWidth, viewportWidth);
    this.updateShake();
  }

  respawn(playerX: number, levelWidth: number, viewportWidth: number) {
    this.x = Camera.clamp(playerX - 280, levelWidth, viewportWidth);
    this.lookAhead = 0;
  }

  impulse(strength: number, frames = 5) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTimer = Math.max(this.shakeTimer, frames);
  }

  static clamp(value: number, levelWidth: number, viewportWidth: number) {
    return Math.max(0, Math.min(Math.max(0, levelWidth - viewportWidth), value));
  }

  private updateShake() {
    if (this.shakeTimer <= 0) { this.shakeX = 0; return; }
    this.shakeX = (Math.random() * 2 - 1) * this.shakeStrength;
    this.shakeStrength *= 0.72;
    this.shakeTimer--;
  }
}
