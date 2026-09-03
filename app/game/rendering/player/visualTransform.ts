import type { PlayerState } from "../../types";

export function playerVisualTransform(state: PlayerState, tick: number) {
  switch (state) {
    case "jumpStart": return { scaleX: 1.06, scaleY: 0.93, offsetY: 2 };
    case "jumpUp": return { scaleX: 0.96, scaleY: 1.05, offsetY: -1 };
    case "fall": return { scaleX: 0.98, scaleY: 1.025, offsetY: 0 };
    case "land": return { scaleX: 1.08, scaleY: 0.91, offsetY: 4 };
    case "skid": return { scaleX: 1.04, scaleY: 0.96, offsetY: 2 };
    case "hurt": return { scaleX: 0.95, scaleY: 1.04, offsetY: -1 };
    case "run": return { scaleX: 1, scaleY: 1, offsetY: Math.sin(tick * 0.55) * 0.7 };
    default: return { scaleX: 1, scaleY: 1, offsetY: 0 };
  }
}
