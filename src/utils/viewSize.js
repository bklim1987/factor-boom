// ============================================================
// 画面尺寸（只影响布局，不影响玩法与计分）
// ============================================================
// full   ：铺满所在区域（原本行为，手机/平板上就该这样）
// compact：限制成一个「宽而矮」的盒子并靠上对齐，空白全留在下方。
//
// 大屏（教室触控屏）上铺满有两个毛病：按钮贴在最底下要往下伸手、
// 左右跨度大到视野和手都要大幅移动。靠上对齐解决前者（按钮整体上移），
// 限宽解决后者 —— 但别限太窄，六个按钮挤在 400px 里每个只剩 57px，
// 反而容易误触，所以宽度留在中间档。
const STORAGE_KEY = 'numberCannon_viewSize';

// 比例介于平板与折叠屏展开之间：够宽，按钮不至于细到误触；够矮，重心能压上去。
// 现场想换比例不用改代码：加 ?box=宽x高，例如 ?box=680x760
const DEFAULT_COMPACT = { width: 600, height: 820 };

function parseBoxParam() {
  try {
    const raw = new URLSearchParams(window.location.search).get('box');
    const m = raw && raw.match(/^(\d{3,4})x(\d{3,4})$/i);
    if (!m) return null;
    return { width: Number(m[1]), height: Number(m[2]) };
  } catch {
    return null;
  }
}

export const COMPACT_VIEW = parseBoxParam() || DEFAULT_COMPACT;

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalize(size) {
  // 'phone' 是早期的叫法，存量设置照旧按紧凑处理
  return size === 'compact' || size === 'phone' ? 'compact' : 'full';
}

// 每位玩家各自独立选择，并按「位置」记住（双人的 A/B 两侧、单人的 solo）。
// 记住的原因：从 tournament hub 进来是直接进游戏的，没有大厅可以慢慢设置，
// 记住之后下一场比赛一上来就是上次选好的尺寸。
export function loadViewSize(slot) {
  return normalize(loadAll()[slot]);
}

export function saveViewSize(slot, size) {
  try {
    const all = loadAll();
    all[slot] = normalize(size);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

// 内层容器样式：compact 时卡住宽高上限（靠上对齐由外层的 flex-start 负责），
// full 时完全不干预
export function viewSizeStyle(size) {
  const compact = normalize(size) === 'compact';
  return {
    width: '100%',
    height: '100%',
    maxWidth: compact ? `${COMPACT_VIEW.width}px` : 'none',
    // 高度上限取「绝对值」和「可用高度的 85%」中较小的那个：窗口本来就不高时
    // 绝对值根本不生效（看不出按钮上移），按比例收一点才能稳定压低重心
    maxHeight: compact ? `min(${COMPACT_VIEW.height}px, 85%)` : 'none',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };
}
