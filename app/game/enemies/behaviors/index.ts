import type { EnemyType, RuntimeEnemy } from "../../types";
import { updateEnemyAnimation } from "../../animation/enemyAnimations.ts";
import type { EnemyBehavior, EnemyBehaviorContext } from "./context.ts";
import { updateBitePlant } from "./bitePlant.ts";
import { updateBlobHopper } from "./blobHopper.ts";
import { updateMaskedBandit } from "./maskedBandit.ts";
import { updateRobotCannon } from "./robotCannon.ts";
import { updateRollingRock } from "./rollingRock.ts";
import { updateRoundBat } from "./roundBat.ts";
import { updateSpikeBeetle } from "./spikeBeetle.ts";
import { updateStealthGhost } from "./stealthGhost.ts";

export const ENEMY_BEHAVIORS: Record<EnemyType, EnemyBehavior> = {
  blobHopper:updateBlobHopper, spikeBeetle:updateSpikeBeetle, roundBat:updateRoundBat,
  rollingRock:updateRollingRock, stealthGhost:updateStealthGhost, bitePlant:updateBitePlant,
  robotCannon:updateRobotCannon, maskedBandit:updateMaskedBandit,
};

export function updateEnemyBehavior(enemy: RuntimeEnemy, context: EnemyBehaviorContext) {
  enemy.age++;
  ENEMY_BEHAVIORS[enemy.type](enemy, context);
  updateEnemyAnimation(enemy);
}
