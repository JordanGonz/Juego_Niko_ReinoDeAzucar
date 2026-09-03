type InputOptions = { onPrimaryAction: () => void; onToggleDebug: () => void };

export class InputManager {
  private keys: Record<string, boolean> = {};
  private pressed = new Set<string>();
  private released = new Set<string>();

  constructor(private readonly options: InputOptions) {}

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clear);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clear);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.clear();
  }

  isDown(...codes: string[]) { return codes.some((code) => this.keys[code]); }
  wasPressed(...codes: string[]) { return codes.some((code) => this.pressed.has(code)); }
  wasReleased(...codes: string[]) { return codes.some((code) => this.released.has(code)); }

  setTouch(code: string, down: boolean) {
    if (down && !this.keys[code]) this.pressed.add(code);
    if (!down && this.keys[code]) this.released.add(code);
    this.keys[code] = down;
  }

  endStep() {
    this.pressed.clear();
    this.released.clear();
  }

  clear = () => {
    this.keys = {};
    this.pressed.clear();
    this.released.clear();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.keys[event.code]) this.pressed.add(event.code);
    this.keys[event.code] = true;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
    if (event.code === "F2" && !event.repeat) { event.preventDefault(); this.options.onToggleDebug(); }
    if ((event.code === "Space" || event.code === "Enter") && !event.repeat) this.options.onPrimaryAction();
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (this.keys[event.code]) this.released.add(event.code);
    this.keys[event.code] = false;
  };

  private onVisibilityChange = () => { if (document.hidden) this.clear(); };
}
