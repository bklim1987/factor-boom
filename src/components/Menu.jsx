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

export default function Menu({ onStartSolo, onStartDuo, onLeaderboard }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bg,
      color: '#e5e7eb',
      padding: '20px',
      gap: '20px',
    }}>
      <RulesPanel />

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
