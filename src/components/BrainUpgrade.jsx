import { useState } from 'react';
import { createPortal } from 'react-dom';
import { analyzeMistakes } from '../utils/brainUpgrade.js';

// 金色，和玩家 B 的紫色错开。玩家色只出现在各自的卡片边框上。
const ACCENT = '#fbbf24';

const buttonBase = {
  padding: '12px 14px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: 'transparent',
  color: ACCENT,
  border: `2px solid ${ACCENT}`,
  borderRadius: '12px',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  minHeight: '48px',
  boxSizing: 'border-box',
};

function MistakeCard({ name, color, player }) {
  const a = analyzeMistakes(player);

  return (
    <div style={{
      flex: '1 1 320px',
      maxWidth: '460px',
      minWidth: 0,
      padding: '16px 18px',
      borderRadius: '12px',
      backgroundColor: '#161e2e',
      border: `2px solid ${color || ACCENT}`,
      textAlign: 'left',
    }}>
      {name && (
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: color || ACCENT, marginBottom: '10px' }}>
          {name}
        </div>
      )}

      <div style={{ fontSize: '19px', fontWeight: 'bold', color: '#fbbf24', lineHeight: 1.4 }}>
        {a.title}
        {a.kind === 'mistake' && (
          <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 'normal' }}>
            {`　本局 ${a.count} 次`}
            {a.total > a.count ? `／共 ${a.total} 次误击` : ''}
          </span>
        )}
      </div>

      {a.kind === 'mistake' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          margin: '12px 0',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: '#0f1623',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>屏幕上是</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#e5e7eb' }}>{a.sample.value}</div>
          </div>
          <div style={{ fontSize: '20px', color: '#6b7280' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>你点了</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#ef4444' }}>{a.sample.prime}</div>
          </div>
        </div>
      )}

      {a.wrong && (
        <div style={{ fontSize: '14px', color: '#e5e7eb', lineHeight: 1.7, marginTop: '10px' }}>
          {a.kind === 'mistake' ? (
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ 哪里想错了　</span>
          ) : (
            <span style={{ color: ACCENT, fontWeight: 'bold' }}>📊 这一局　</span>
          )}
          {a.wrong}
        </div>
      )}

      <div style={{ fontSize: '14px', color: '#e5e7eb', lineHeight: 1.7, marginTop: '10px' }}>
        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ 下一局这样想　</span>
        {a.next}
      </div>

      {a.worked && (
        <div style={{
          fontSize: '14px',
          color: '#e5e7eb',
          lineHeight: 1.7,
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: '8px',
          backgroundColor: '#0f1623',
          border: '1px solid #263040',
        }}>
          <span style={{ color: ACCENT, fontWeight: 'bold' }}>🔍 拿这道题走一遍　</span>
          {a.worked}
        </div>
      )}

      {a.kind === 'mistake' && a.others.length > 0 && (
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.8, marginTop: '12px', borderTop: '1px solid #263040', paddingTop: '8px' }}>
          本局还犯过：
          {a.others.map((o) => `${o.title} ×${o.count}`).join('、')}
        </div>
      )}
    </div>
  );
}

// cards: [{ name, color, player }] —— 单人给一张，双人给两张
export default function BrainUpgrade({ cards, buttonStyle = null }) {
  const [open, setOpen] = useState(false);
  const list = (cards || []).filter((c) => c && c.player);
  if (list.length === 0) return null;

  return (
    <>
      <button
        onPointerDown={(e) => { e.preventDefault(); setOpen(true); }}
        style={{ ...buttonBase, ...buttonStyle }}
      >
        🧠 升级大脑
      </button>
      {open && createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(8, 12, 20, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'safe center',
        gap: '14px',
        padding: '24px 20px',
        overflowY: 'auto',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: ACCENT }}>🧠 升级大脑</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
          要升级的不是装备，是你的思考方式
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '980px',
      }}>
        {list.map((c, i) => (
          <MistakeCard key={c.name || i} name={c.name} color={c.color} player={c.player} />
        ))}
      </div>

      <button
        onPointerDown={(e) => { e.preventDefault(); setOpen(false); }}
        style={{
          padding: '14px 44px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#fbbf24',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          minHeight: '52px',
        }}
      >
        知道了
      </button>
    </div>,
    document.body,
      )}
    </>
  );
}
