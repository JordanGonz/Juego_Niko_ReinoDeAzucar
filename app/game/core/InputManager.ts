type InputOptions = { onPrimaryAction: () => void; onToggleDebug: () => void; onTogglePause: () => void; onFocusLost: () => void };

export class InputManager {
  private keys: Record<string, boolean> = {};
  private pressed = new Set<string>();
  private released = new Set<string>();

  private readonly options: InputOptions;
  constructor(options: InputOptions) { this.options = options; }

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onFocusLost);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onFocusLost);
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
    if (event.defaultPrevented) return;
    if (event.code === "KeyP" || event.code === "Escape") {
      event.preventDefault();
      if (!event.repeat) this.options.onTogglePause();
      return;
    }
    if (event.target instanceof Element && event.target.closest("button, input, textarea, select, [contenteditable], dialog")) return;
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

  private onFocusLost = () => { this.clear(); this.options.onFocusLost(); };
  private onVisibilityChange = () => { if (document.hidden) this.onFocusLost(); };
}
