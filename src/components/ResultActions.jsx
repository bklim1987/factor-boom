import BrainUpgrade from './BrainUpgrade.jsx';

// 结算页底部：两行等宽按钮，保存单独垫在最后。
// 只有「再来一局」是实心的，其余都是描边，避免一排互相抢的色块。
const shell = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '10px',
  width: 'min(440px, 100%)',
  animation: 'fadeIn 0.4s ease-in',
};

const rowStyle = {
  display: 'flex',
  gap: '10px',
  width: '100%',
};

function btn(tone) {
  const common = {
    flex: '1 1 0',
    minWidth: 0,
    padding: '12px 14px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '12px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    minHeight: '48px',
    boxSizing: 'border-box',
  };
  if (tone === 'primary') {
    return { ...common, backgroundColor: '#fbbf24', color: '#111', border: '2px solid #fbbf24' };
  }
  if (tone === 'save') {
    return {
      ...common,
      flex: '0 0 auto',
      backgroundColor: 'transparent',
      color: '#10b981',
      border: '2px solid #10b981',
      padding: '12px 18px',
    };
  }
  return { ...common, backgroundColor: 'transparent', color: '#9ca3af', border: '2px solid #374151' };
}

export default function ResultActions({
  brainCards,
  name,
  onNameChange,
  saved = false,
  onSave,
  onRestart,
  onBack,
  onLeaderboard,
}) {
  return (
    <div style={shell}>
      <div style={rowStyle}>
        <BrainUpgrade cards={brainCards} buttonStyle={{ flex: '1 1 0', minWidth: 0 }} />
        {onRestart && (
          <button
            onPointerDown={(e) => { e.preventDefault(); onRestart(); }}
            style={btn('primary')}
          >
            再来一局
          </button>
        )}
      </div>

      {(onBack || onLeaderboard) && (
        <div style={rowStyle}>
          {onBack && (
            <button
              onPointerDown={(e) => { e.preventDefault(); onBack(); }}
              style={btn('ghost')}
            >
              返回主页
            </button>
          )}
          {onLeaderboard && (
            <button
              onPointerDown={(e) => { e.preventDefault(); onLeaderboard(); }}
              style={btn('ghost')}
            >
              查看排行榜
            </button>
          )}
        </div>
      )}

      {onSave && (
        saved ? (
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
            成绩已保存
          </div>
        ) : (
          <div style={rowStyle}>
            {onNameChange && (
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="输入名字（可选）"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '8px 12px',
                  fontSize: '16px',
                  backgroundColor: '#263040',
                  color: '#e5e7eb',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  textAlign: 'center',
                  outline: 'none',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            )}
            <button
              onPointerDown={(e) => { e.preventDefault(); onSave(); }}
              style={{ ...btn('save'), flex: onNameChange ? '0 0 auto' : '1 1 0' }}
            >
              保存成绩
            </button>
          </div>
        )
      )}
    </div>
  );
}
