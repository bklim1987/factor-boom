import { PRIMES, MONSTER_TYPES, COLS } from './constants.js';

let nextId = 1;

// ============================================================
// Arena 确定性数值流（不影响 solo/duo：未设 seed 时一切照旧）
// ============================================================
// 比赛公平的关键是「第 N 只怪的数值对所有人相同」（arena-spec §3.1
// 「射击定怪物序列」）。生成时机/落点与各自战局有关，无法也不必统一；
// 数值按 类型+序号 从独立的确定性流取 —— 人人打到的第 N 只 BOSS 数值一致。
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedToInt(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  const str = String(seed == null ? '' : seed);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

let valueStreams = null; // { small, big, boss } → 各自独立的 PRNG

export function setMonsterValueSeed(seed) {
  const n = seedToInt(seed);
  valueStreams = {
    small: mulberry32(n ^ 0x51DE0001),
    big:   mulberry32(n ^ 0x51DE0002),
    boss:  mulberry32(n ^ 0x51DE0003),
  };
}

export function clearMonsterValueSeed() { valueStreams = null; }

function pickRandom(arr, rand = Math.random) {
  return arr[Math.floor(rand() * arr.length)];
}

// BOSS 生成条件限制（基于“已选”质因数动态过滤可选项）
// 1. 已经有 2 个 7，则禁止使用 13
// 2. 已经有 2 个 13，则禁止使用 7 和 13
function pickPrimeForBoss(factorsSoFar, rand = Math.random) {
  const count7 = factorsSoFar.filter((p) => p === 7).length;
  const count13 = factorsSoFar.filter((p) => p === 13).length;

  const allowed = PRIMES.filter((p) => {
    if (p === 13 && count7 >= 2) return false;
    if ((p === 7 || p === 13) && count13 >= 2) return false;
    return true;
  });

  // 理论上 allowed 不会为空；兜底避免极端情况下报错
  return pickRandom(allowed.length ? allowed : PRIMES, rand);
}

export function createMonster(type, existingMonsters) {
  const config = MONSTER_TYPES[type];
  const factors = [];
  let value = 1;
  // 数值：arena 模式走确定性流（人人相同）；落点仍随各自战局（下方 Math.random）
  const valueRand = valueStreams ? valueStreams[type] : Math.random;
  const pickPrime = type === 'boss' ? () => pickPrimeForBoss(factors, valueRand) : () => pickRandom(PRIMES, valueRand);
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
