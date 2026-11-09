// 画面尺寸切换：两个尺寸、一键切换，当前选中的高亮。
// 每位玩家一个，放在自己那半边 —— 倒数画面上是大按钮（比赛前调整），
// 对局中缩在自己的信息栏里（随时能改，但不碍事）。
// 对局中只给图标：信息栏要和名字、分数、连击挤在一行，文字会把名字顶成两行
const OPTIONS = [
  { value: 'full', icon: '🖥', label: '🖥 大屏', title: '铺满整块屏幕' },
  { value: 'compact', icon: '📐', label: '📐 紧凑', title: '画面收窄并整体上移，按钮更靠手' },
];

export default function ViewSizeToggle({ value, playerColor = '#9ca3af', big = false, onChange }) {
  return (
    <div style={{ display: 'flex', gap: big ? '8px' : '3px', flexShrink: 0 }}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            onPointerDown={(e) => { e.preventDefault(); if (!active) onChange(opt.value); }}
            style={{
              padding: big ? '12px 20px' : '3px 6px',
              fontSize: big ? '16px' : '11px',
              fontWeight: 'bold',
              lineHeight: 1.2,
              minHeight: big ? '48px' : '24px',
              backgroundColor: active ? playerColor : '#1a2234',
              color: active ? '#000' : '#9ca3af',
              border: `${big ? 2 : 1}px solid ${active ? playerColor : '#374151'}`,
              borderRadius: big ? '10px' : '6px',
              cursor: active ? 'default' : 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {big ? opt.label : opt.icon}
          </button>
        );
      })}
    </div>
  );
}
