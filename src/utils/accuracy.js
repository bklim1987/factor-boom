// ============================================================
// 准确率奖励（局末结算，人人有奖）
// ============================================================
// 准确率 = 答对次数 /（答对 + 答错）。只看点击，怪物逃脱不计入
// —— 逃脱本身已经直接扣分了，不该再从准确率里扣一次。
//
// 奖励比例 = 准确率 ÷ 10：准确率 100% 加 10%，80% 加 8%。
// 奖励基数是「击杀得分」，也就是逃脱扣分之前的那个数：
//   显示分 -350、逃脱扣了 800 → 击杀得分 450 → 奖励 = 450 × 准确率 ÷ 10
// 用击杀得分而不是显示分，是因为逃脱已经扣过一次了，再从奖励基数里扣第二次，
// 逃脱多的学生连「答得准」这笔奖励都拿不到，甚至会被倒扣（负数乘正比例）。
const BONUS_DIVISOR = 10;

export function getAccuracy(player) {
  const hits = player?.hits || 0;
  const misses = player?.locks || 0;
  const shots = hits + misses;
  return { hits, misses, shots, rate: shots > 0 ? hits / shots : 0 };
}

// 百分比整数，用于显示（80% 显示成 80）
export function accuracyPercent(player) {
  return Math.round(getAccuracy(player).rate * 100);
}

export function bonusPercent(player) {
  // 显示用的奖励百分比，和下面的实际加成同源：80% 准确率 → 8%
  return Math.round((accuracyPercent(player) / BONUS_DIVISOR) * 10) / 10;
}

// 奖励基数 = 击杀得分（逃脱扣分之前）
export function killScoreOf(player) {
  if (typeof player?.killScore === 'number') return player.killScore;
  // 兜底：老数据没有这个字段时，按显示分 + 逃脱扣分倒推
  return Math.max(0, (player?.score || 0) + (player?.escapeScore || 0));
}

export function escapeScoreOf(player) {
  return player?.escapeScore || 0;
}

// 奖励公布前结算页先显示这个数。player.score 本身一直是加完奖励的最终分，
// 上报给 arena / tournament hub 用的也是它，滚动动画只改画面上的数字。
export function scoreBeforeBonus(player) {
  if (typeof player?.baseScore === 'number') return player.baseScore;
  return (player?.score || 0) - (player?.accuracyBonus || 0);
}

// 局末调用：把奖励加进总分，过程留在 player 上给结算页显示
export function applyAccuracyBonus(player) {
  const { rate, shots } = getAccuracy(player);
  const bonus = shots > 0
    ? Math.round((killScoreOf(player) * rate) / BONUS_DIVISOR)
    : 0;
  player.baseScore = player.score; // 奖励之前的显示分（击杀得分 − 逃脱扣分）
  player.accuracyBonus = bonus;
  player.score = player.baseScore + bonus;
}
