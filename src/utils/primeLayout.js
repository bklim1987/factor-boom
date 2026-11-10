// 质数键排法（只影响布局，不影响玩法与计分）
// wrap：窄屏两排三列，减少误触。默认。
// row ：窄屏也保持一排六个，和大屏是同一套手感。
// 按钮区宽于 520px 时两种选择看起来一样，始终是一排。
const STORAGE_KEY = 'numberCannon_primeLayout';

export function loadPrimeLayout() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'row' ? 'row' : 'wrap';
  } catch {
    return 'wrap';
  }
}

export function savePrimeLayout(layout) {
  const value = layout === 'row' ? 'row' : 'wrap';
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
  return value;
}
