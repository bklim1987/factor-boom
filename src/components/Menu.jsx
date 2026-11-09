import { COLORS } from '../utils/constants.js';
import RulesPanel from './RulesPanel.jsx';

const btnBase = {
  padding: '16px 48px',
  fontSize: '20px',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  minHeight: '56px',
  minWidth: '200px',
};

const diffBtn = (active) => ({
  padding: '8px 22px',
  fontSize: '15px',
  fontWeight: 'bold',
  backgroundColor: active ? '#fbbf24' : '#1a2234',
  color: active ? '#000' : '#9ca3af',
  border: `2px solid ${active ? '#fbbf24' : '#374151'}`,
  borderRadius: '8px',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  minHeight: '40px',
});

const DIFFICULTY_HINT = {
  easy: '基础：大怪的 7、13 和 BOSS 的 7、11、13 各自最多出现一次',
  normal: '进阶：不限制，大怪最大到 13×13×13',
};

export default function Menu({ difficulty = 'normal', onSelectDifficulty, onStartSolo, onStartDuo, onLeaderboard }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // safe center：窗口放不下时不居中、不裁掉两头，配合下面的滚动仍能点到开始按钮
      justifyContent: 'safe center',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      backgroundColor: COLORS.bg,
      color: '#e5e7eb',
      padding: '20px',
      gap: '20px',
    }}>
      <RulesPanel />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>题目难度</span>
          <button
            onPointerDown={(e) => { e.preventDefault(); onSelectDifficulty?.('easy'); }}
            style={diffBtn(difficulty === 'easy')}
          >
            基础
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); onSelectDifficulty?.('normal'); }}
            style={diffBtn(difficulty === 'normal')}
          >
            进阶
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', maxWidth: '420px' }}>
          {DIFFICULTY_HINT[difficulty]}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onPointerDown={(e) => { e.preventDefault(); onStartSolo(); }}
          style={{ ...btnBase, backgroundColor: COLORS.playerA, color: '#000' }}
        >
          单人挑战
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); onStartDuo(); }}
          style={{ ...btnBase, backgroundColor: '#fbbf24', color: '#000' }}
        >
          双人对战
        </button>
      </div>

      <button
        onPointerDown={(e) => { e.preventDefault(); onLeaderboard(); }}
        style={{
          padding: '10px 32px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          border: '2px solid #374151',
          borderRadius: '10px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          minHeight: '44px',
        }}
      >
        排行榜
      </button>
    </div>
  );
}
