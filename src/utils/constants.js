export const COLS = 5;
export const ROWS = 10;
export const TICK_MS = 100;
export const PRIMES = [2, 3, 5, 7, 11, 13];
// 基础难度：同一只怪里，这些质数各自最多出现一次（按怪物类型分别设定）。
// 只卡「重复」不卡「组合」，所以 7×11×13=1001 这类好题仍然出得来；
// 小怪完全不限，7²/11²/13² 这些平方数题目照常出现。
export const EASY_UNIQUE_PRIMES = {
  small: [],
  big: [7, 13],
  boss: [7, 11, 13],
};
export const SPAWN_INTERVAL = 3000;
export const LOCK_DURATION = 1000;
export const HIT_FLASH_DURATION = 300;
export const MISS_FLASH_DURATION = 500;
export const COMBO_THRESHOLD = 10;
export const COMBO_MULTIPLIER = 1.5;
export const DEFAULT_DURATION = 60;
export const PROJECTILE_FLIGHT_MS = 200;

export const MONSTER_TYPES = {
  small: { factorCount: 2, pts: 100, fallMs: 3000, label: null, color: { bg: '#064e3b', border: '#10b981', text: '#6ee7b7' } },
  big:   { factorCount: 3, pts: 200, fallMs: 2500, label: '大怪', color: { bg: '#7c2d12', border: '#f97316', text: '#fdba74' } },
  boss:  { factorCount: 5, pts: 500, fallMs: 3000, label: 'BOSS', color: { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' } },
};

export const COLORS = {
  bg: '#0b1120',
  gridBg: '#111827',
  cellBg: '#1a2234',
  cellBorder: '#263040',
  playerA: '#38bdf8',
  playerB: '#c084fc',
};
