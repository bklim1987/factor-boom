const STORAGE_KEY = 'numberCannon_scores';
const MAX_RECORDS = 50;

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
  } catch {}
}

export function saveScore({ mode, difficulty, name, score, kills, maxCombo, missed, locks, result }) {
  const records = loadAll();
  records.push({
    mode,
    difficulty: difficulty === 'easy' ? 'easy' : 'normal',
    name,
    score,
    kills,
    maxCombo,
    missed,
    locks,
    result,
    date: Date.now(),
  });
  records.sort((a, b) => b.score - a.score);
  saveAll(records);
}

// 历史记录没有 difficulty 字段 —— 那些都是加难度开关之前的成绩，等同进阶
export function recordDifficulty(record) {
  return record.difficulty === 'easy' ? 'easy' : 'normal';
}

export function getScores(mode, difficulty) {
  let all = loadAll();
  if (mode) all = all.filter(r => r.mode === mode);
  if (difficulty) all = all.filter(r => recordDifficulty(r) === difficulty);
  return all;
}

export function clearScores() {
  localStorage.removeItem(STORAGE_KEY);
}
