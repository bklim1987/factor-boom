import { PRIMES, MONSTER_TYPES, COLS } from './constants.js';

let nextId = 1;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// BOSS 生成条件限制（基于“已选”质因数动态过滤可选项）
// 1. 已经有 2 个 7，则禁止使用 13
// 2. 已经有 2 个 13，则禁止使用 7 和 13
function pickPrimeForBoss(factorsSoFar) {
  const count7 = factorsSoFar.filter((p) => p === 7).length;
  const count13 = factorsSoFar.filter((p) => p === 13).length;

  const allowed = PRIMES.filter((p) => {
    if (p === 13 && count7 >= 2) return false;
    if ((p === 7 || p === 13) && count13 >= 2) return false;
    return true;
  });

  // 理论上 allowed 不会为空；兜底避免极端情况下报错
  return pickRandom(allowed.length ? allowed : PRIMES);
}

export function createMonster(type, existingMonsters) {
  const config = MONSTER_TYPES[type];
  const factors = [];
  let value = 1;
  const pickPrime = type === 'boss' ? () => pickPrimeForBoss(factors) : () => pickRandom(PRIMES);
  for (let i = 0; i < config.factorCount; i++) {
    const p = pickPrime();
    factors.push(p);
    value *= p;
  }

  const blockedCols = new Set();
  for (const m of existingMonsters) {
    if (m.row <= 1) blockedCols.add(m.col);
  }

  let col;
  const freeCols = [];
  for (let c = 0; c < COLS; c++) {
    if (!blockedCols.has(c)) freeCols.push(c);
  }

  if (freeCols.length > 0) {
    col = pickRandom(freeCols);
  } else {
    col = Math.floor(Math.random() * COLS);
  }

  return {
    id: nextId++,
    type,
    col,
    row: 0,
    value,
    factors,
    pts: config.pts,
    fallMs: config.fallMs,
    fallAcc: 0,
    hitFlash: 0,
  };
}
