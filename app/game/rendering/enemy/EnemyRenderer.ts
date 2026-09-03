import type { RuntimeEnemy } from "../../types";

export type EnemyRenderContext = { ctx:CanvasRenderingContext2D; enemy:RuntimeEnemy; tick:number };
export interface EnemyRenderer { render(context: EnemyRenderContext): void }
