import { PRIMES } from './constants.js';

// ============================================================
// 升级大脑：把本局点错的每一次归类，挑出最常犯的一类，给一条能照着做的建议
// ============================================================
// 每次误击记下的是「当时屏幕上的数字」和「点下去的质数」。
// 怪物被打中会边除边变小，所以这个数字就是学生当时真正看到的那个数。

function digitSum(value) {
  return String(value).split('').reduce((sum, c) => sum + Number(c), 0);
}

function digitSumText(value) {
  return `${String(value).split('').join('+')} = ${digitSum(value)}`;
}

export function factorize(value) {
  const out = [];
  let n = value;
  for (const p of PRIMES) {
    while (n % p === 0) {
      out.push(p);
      n /= p;
    }
  }
  if (n > 1) out.push(n); // 怪物的数都是这几个质数乘出来的，兜底而已
  return out;
}

function answerText(value) {
  const fs = factorize(value);
  return fs.length > 1 ? `${value} = ${fs.join(' × ')}` : `${value} 本身就是质数`;
}

// 11 的判别法：从右边起一位加一位减（奇位和减偶位和），差是 11 的倍数就有因数 11。
// 1859 → 9-5+8-1 = 11 → 是 11 的倍数。0 也算，比如 77 → 7-7 = 0。
function elevenCheck(value) {
  const parts = [];
  let sum = 0;
  String(value).split('').reverse().forEach((c, i) => {
    const sign = i % 2 === 0 ? 1 : -1;
    sum += sign * Number(c);
    parts.push(i === 0 ? c : `${sign > 0 ? '+' : '-'}${c}`);
  });
  return { text: `${parts.join('')} = ${sum}`, divisible: sum % 11 === 0 };
}

// 小因数都拿光之后，候选只剩 7、11、13，所以验掉 11 和 7，剩下的必然是 13
function bigPrimeWalkthrough(value) {
  if (value < 10) return '';
  const e = elevenCheck(value);
  if (e.divisible) {
    return `${value} → ${e.text}，是 11 的倍数 → ${value} ÷ 11 = ${value / 11}`;
  }
  if (value % 7 === 0) {
    return `${value} → ${e.text}，不是 11 的倍数 → 换 7 试：${value} ÷ 7 = ${value / 7}`;
  }
  return `${value} → ${e.text}，不是 11 的倍数；也除不尽 7 → 那就只能是 13：${value} ÷ 13 = ${value / 13}`;
}

// 一眼能看出来的小因数：末位 0/5 → 5，偶数 → 2，数字和是 3 的倍数 → 3
// 顺序是按「看一眼就知道」的程度排的，末位最醒目，数字和还要动手加
function obviousFactor(value) {
  if (value % 5 === 0) return 5;
  if (value % 2 === 0) return 2;
  if (value % 3 === 0) return 3;
  return 0;
}

const TITLES = {
  skippedSmall: '数字一大就去赌大质数',
  odd: '奇数点了 2',
  notFive: '末位不是 0 或 5 却点 5',
  notThree: '不是 3 的倍数却点 3',
  bigGuess: '只剩 7、11、13 时猜错',
};

// 归类只看「点下的是哪个质数」+「这个数长什么样」，不需要知道正确答案
function classify({ value, prime }) {
  if (prime === 2) return 'odd';      // 点 2 还错，说明这个数是奇数
  if (prime === 5) return 'notFive';  // 点 5 还错，说明末位不是 0 也不是 5
  if (prime === 3) return 'notThree'; // 点 3 还错，说明数字和不是 3 的倍数
  return obviousFactor(value) ? 'skippedSmall' : 'bigGuess';
}

const ADVICE = {
  skippedSmall: ({ value, prime }) => {
    const f = obviousFactor(value);
    const signal = f === 5
      ? `末位是 ${value % 10}`
      : f === 2
        ? '是偶数'
        : `各位数字相加 ${digitSumText(value)}，是 3 的倍数`;
    return {
      wrong: `${value} ${signal}，一眼就知道它有因数 ${f}，但 ${prime} 除不进去。`,
      next: `先用小因数把数字砍小：${value} ÷ ${f} = ${value / f}，马上就看得清了。数字越大越要先看 2、5、3，看完再考虑 7、11、13。`,
    };
  },
  odd: ({ value }) => ({
    wrong: `${value} 是奇数，奇数永远分不出 2。`,
    next: `末位是 1、3、5、7、9 就直接跳过 2，一秒都不用想。${answerText(value)}。`,
  }),
  notFive: ({ value }) => ({
    wrong: `${value} 的末位是 ${value % 10}，只有末位 0 或 5 的数才有因数 5。`,
    next: `点 5 之前只要看一眼末位。${answerText(value)}。`,
  }),
  notThree: ({ value }) => ({
    wrong: `${value} 的各位数字相加 ${digitSumText(value)}，不是 3 的倍数，所以 ${value} 也没有因数 3。`,
    next: `数字和是 3 的倍数，这个数才是 3 的倍数。${answerText(value)}。`,
  }),
  bigGuess: ({ value, prime }) => ({
    wrong: `${value} 已经没有 2、3、5 可以拿了，只能从 7、11、13 里选，但不是 ${prime}。${answerText(value)}。`,
    next: '别猜，按顺序验：① 看 11 —— 从右边起一位加一位减（奇位和减偶位和），差是 11 的倍数（0 也算）就有因数 11；② 看 7 —— 两位数直接想乘法表（49、77、91），大数就心算除以 7；③ 11 和 7 都不是，剩下的只能是 13。',
    worked: bigPrimeWalkthrough(value),
  }),
};

// 次数一样时，按这个顺序挑：越靠前的越值得先改
const CATEGORY_ORDER = ['skippedSmall', 'odd', 'notFive', 'notThree', 'bigGuess'];

export function analyzeMistakes(player) {
  const misses = (player?.missShots || []).filter((m) => m && m.value > 1);
  const escapes = player?.missed || 0;
  const escapeScore = player?.escapeScore || 0;
  const shots = (player?.hits || 0) + (player?.locks || 0);

  if (misses.length === 0) {
    // 没点错：按「有没有怪物逃脱」给下一局的目标
    if (shots === 0) {
      return {
        kind: 'idle',
        title: '这一局几乎没有出手',
        next: '先点一下怪物所在的那一列把大炮移过去，再点下面的质数。只要开口打，分数就会动。',
      };
    }
    if (escapes > 0) {
      return {
        kind: 'clean',
        title: '一次都没点错！',
        wrong: `准确率 100%，没有任何误击。这一局丢分全在逃脱：${escapes} 只怪落地，扣掉 ${escapeScore} 分。`,
        next: '下一局盯最下面那一只先打，它最快落地；BOSS 落地要扣 500 分，看到就优先处理。',
      };
    }
    return {
      kind: 'perfect',
      title: '完美一局！',
      wrong: '没有点错，也没有怪物落地。',
      next: '下一局挑战连击：连续命中 10 次之后，每一只怪都是 1.5 倍分。',
    };
  }

  const groups = new Map();
  for (const m of misses) {
    const key = classify(m);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  const ranked = [...groups.entries()]
    .map(([key, items]) => ({ key, items, count: items.length }))
    .sort((a, b) => b.count - a.count
      || CATEGORY_ORDER.indexOf(a.key) - CATEGORY_ORDER.indexOf(b.key));

  const top = ranked[0];
  // 同一类里拿数字最大的那次当例子 —— 数字越大越能说明问题
  const sample = top.items.reduce((a, b) => (b.value > a.value ? b : a));

  return {
    kind: 'mistake',
    title: TITLES[top.key],
    count: top.count,
    total: misses.length,
    sample,
    ...ADVICE[top.key](sample),
    others: ranked.slice(1).map((r) => ({ key: r.key, title: TITLES[r.key], count: r.count })),
  };
}
