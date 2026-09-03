import type { GamePower, Player } from "../../types";

export type PlayerRenderArgs = {
  ctx: CanvasRenderingContext2D;
  player: Player;
  frame: number;
  tick: number;
  power: GamePower;
};

export interface PlayerRenderer {
  render(args: PlayerRenderArgs): void;
}
