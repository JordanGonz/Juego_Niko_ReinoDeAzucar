export type SessionState = {
  score: number;
  coins: number;
  lives: number;
  power: "";
  levelIndex: number;
};

export function createInitialSession(): SessionState {
  return { score: 0, coins: 0, lives: 3, power: "", levelIndex: 0 };
}

export function nextUnlockedLevel(current: number, completed: number, levelCount: number) {
  return Math.max(current, Math.min(completed + 1, levelCount - 1));
}
