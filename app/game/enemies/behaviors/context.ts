import type { ParticleSystem } from "../../systems/ParticleSystem";
import type { Player, RuntimeEnemy } from "../../types";

export type EnemyBehaviorContext = {
  player: Player;
  particles: ParticleSystem;
  fireProjectile: (enemy: RuntimeEnemy) => void;
};

export type EnemyBehavior = (enemy: RuntimeEnemy, context: EnemyBehaviorContext) => void;

export function playerDistance(enemy: RuntimeEnemy, player: Player) {
  return Math.abs((player.x + player.collisionBounds.width / 2) - (enemy.x + enemy.collisionBounds.width / 2));
}
