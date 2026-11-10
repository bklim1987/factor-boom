// 质数键排法：两排减少误触，一排与大屏手感相同。
// 整台设备共用一个选择。倒数画面用大按钮，对局中缩在信息栏里。
const OPTIONS = [
  { value: 'wrap', label: '两排', title: '窄屏分成两排，减少误触' },
  { value: 'row', label: '一排', title: '保持一排六个，与大屏手感相同' },
];

export default function PrimeLayoutToggle({ value, playerColor = '#9ca3af', big = false, onChange }) {
  return (
    <div style={{ display: 'flex', gap: big ? '8px' : '3px', flexShrink: 0 }}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            aria-pressed={active}
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
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
