export class Camera {
  x = 0;

  reset() {
    this.x = 0;
  }

  follow(playerX: number, levelWidth: number, viewportWidth: number) {
    this.x += ((playerX - 280) - this.x) * 0.08;
    this.x = Camera.clamp(this.x, levelWidth, viewportWidth);
  }

  respawn(playerX: number, levelWidth: number, viewportWidth: number) {
    this.x = Camera.clamp(playerX - 280, levelWidth, viewportWidth);
  }

  static clamp(value: number, levelWidth: number, viewportWidth: number) {
    return Math.max(0, Math.min(levelWidth - viewportWidth, value));
  }
}
