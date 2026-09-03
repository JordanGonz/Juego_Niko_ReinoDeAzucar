type InputOptions = {
  onPrimaryAction: () => void;
  onToggleDebug: () => void;
};

export class InputManager {
  private keys: Record<string, boolean> = {};

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

  isDown(...codes: string[]) {
    return codes.some((code) => this.keys[code]);
  }

  setTouch(code: string, pressed: boolean) {
    this.keys[code] = pressed;
  }

  clear = () => {
    this.keys = {};
  };

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys[event.code] = true;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
    if (event.code === "F2" && !event.repeat) {
      event.preventDefault();
      this.options.onToggleDebug();
    }
    if ((event.code === "Space" || event.code === "Enter") && !event.repeat) this.options.onPrimaryAction();
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys[event.code] = false;
  };

  private onVisibilityChange = () => {
    if (document.hidden) this.clear();
  };
}
