import { LEVELS, PROGRESS_KEY } from "../levels.ts";

export const ADVENTURE_SAVE_KEY = "niko-adventure-v1";

export type RegionProgress = {
  coins: number[];
  pickups: number[];
  checkpointId: string | null;
  bossDefeated: boolean;
  completed: boolean;
};

export type AdventureSave = {
  version: 1;
  unlockedLevel: number;
  currentRegion: number;
  visitedLevels: number[];
  regions: RegionProgress[];
  score: number;
  lives: number;
};

export const emptyRegion = (): RegionProgress => ({ coins: [], pickups: [], checkpointId: null, bossDefeated: false, completed: false });
export const emptyAdventureSave = (): AdventureSave => ({ version: 1, unlockedLevel: 0, currentRegion: 0, visitedLevels: [], regions: LEVELS.map(() => emptyRegion()), score: 0, lives: 3 });
const boundedInteger = (value: unknown, minimum: number, maximum: number, fallback: number) =>
  Number.isInteger(value) ? Math.max(minimum, Math.min(maximum, value as number)) : fallback;
const indices = (value: unknown, count: number) => Array.isArray(value) ?
  [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < count))] : [];

export function readAdventureSave(storage: Pick<Storage, "getItem">): AdventureSave {
  const oldUnlock = boundedInteger(Number.parseInt(storage.getItem(PROGRESS_KEY) ?? "0", 10), 0, LEVELS.length - 1, 0);
  let raw: unknown;
  try { raw = JSON.parse(storage.getItem(ADVENTURE_SAVE_KEY) ?? "null"); } catch { raw = null; }
  const data = raw && typeof raw === "object" ? raw as Partial<AdventureSave> : {};
  const unlockedLevel = Math.max(oldUnlock, boundedInteger(data.unlockedLevel, 0, LEVELS.length - 1, 0));
  const regions = LEVELS.map((level, index) => {
    const region = data.regions?.[index];
    if (!region || typeof region !== "object") return { ...emptyRegion(), completed: index < unlockedLevel };
    return {
      coins: indices(region.coins, level.coins.length),
      pickups: indices(region.pickups, level.pickups.length),
      checkpointId: typeof region.checkpointId === "string" &&
        level.checkpoints?.some((item) => item.id === region.checkpointId) ? region.checkpointId : null,
      bossDefeated: region.bossDefeated === true,
      completed: region.completed === true || index < unlockedLevel,
    };
  });
  // Existing players keep the bosses they already passed in the older save format.
  if (unlockedLevel >= 2) regions[1].bossDefeated = true;
  return {
    version: 1,
    unlockedLevel,
    currentRegion: boundedInteger(data.currentRegion, 0, unlockedLevel, unlockedLevel),
    visitedLevels: indices(data.visitedLevels, LEVELS.length),
    regions,
    score: boundedInteger(data.score, 0, 99_999_999, 0),
    lives: boundedInteger(data.lives, 1, 5, 3),
  };
}

export function writeAdventureSave(storage: Pick<Storage, "setItem">, save: AdventureSave) {
  storage.setItem(ADVENTURE_SAVE_KEY, JSON.stringify(save));
  storage.setItem(PROGRESS_KEY, String(save.unlockedLevel));
}
