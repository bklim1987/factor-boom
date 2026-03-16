import { useRef, useState, useCallback } from 'react';
import { PRIMES, COLS, ROWS, COLORS, COMBO_THRESHOLD, LOCK_DURATION } from '../utils/constants.js';
import GameGrid from './GameGrid.jsx';
import PrimeButton from './PrimeButton.jsx';

export default function PlayerSide({ player, name, side, playerColor, onMove, onShoot, timeLeft, duration }) {
  if (!player) return null;

  const [projectiles, setProjectiles] = useState([]);
  const gridRef = useRef(null);

  const lockRemaining = player.locked
    ? Math.max(0, (LOCK_DURATION - player.lockAcc) / 1000).toFixed(1)
    : 0;

  const comboActive = player.mult > 1;
  const prevComboRef = useRef(0);
  const comboJustActivated = comboActive && prevComboRef.current < COMBO_THRESHOLD;
  if (player.combo !== prevComboRef.current) {
    prevComboRef.current = player.combo;
  }

  const handleShoot = useCallback((prime) => {
    onShoot(side, prime);

    const gridEl = gridRef.current;
    if (!gridEl) return;
    const rect = gridEl.getBoundingClientRect();
    const GAP = 1;
    const cellW = (rect.width - (COLS - 1) * GAP) / COLS;
    const cellH = (rect.height - (ROWS - 1) * GAP) / ROWS;

    const col = player.cannon;
    const startX = col * (cellW + GAP) + cellW / 2;
    const startY = rect.height;

    const monstersInCol = player.monsters.filter(m => m.col === col);
    let endY, hit;
    if (monstersInCol.length > 0) {
      monstersInCol.sort((a, b) => b.row - a.row);
      const target = monstersInCol[0];
      endY = target.row * (cellH + GAP) + cellH / 2;
      hit = target.value % prime === 0;
    } else {
      endY = 0;
      hit = true;
    }

    setProjectiles(prev => [...prev, {
      id: Date.now() + Math.random(),
      prime,
      startX,
      startY,
      endX: startX,
      endY,
      hit,
    }]);
  }, [side, onShoot, player.cannon, player.monsters]);

  const removeProjectile = useCallback((id) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '4px',
      paddingBottom: '32px',
      position: 'relative',
      backgroundColor: player.missFlash > 0 ? 'rgba(239,68,68,0.2)' : 'transparent',
      transition: 'background-color 0.15s',
      animation: player.screenShake > 0 ? 'screenShake 0.4s ease-in-out' : 'none',
    }}>
      {comboJustActivated && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(180deg, rgba(251,191,36,0.6) 0%, transparent 100%)',
          animation: 'comboActivate 200ms ease-out forwards',
          pointerEvents: 'none',
          zIndex: 5,
        }} />
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        minHeight: '5%',
        color: playerColor,
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        <span>{name}</span>
        <span style={{
          fontSize: '18px',
          color: comboActive ? '#fbbf24' : playerColor,
          textShadow: comboActive ? '0 0 12px rgba(251,191,36,0.8)' : 'none',
          transition: 'color 0.2s, text-shadow 0.2s',
        }}>
          {player.score}
        </span>
        <span style={{ fontSize: '12px' }}>
          {comboActive ? (
            <span style={{ color: '#fbbf24', animation: 'pulse 0.5s infinite' }}>
              x1.5 COMBO!
            </span>
          ) : (
            <span
              key={player.combo}
              style={{
                display: 'inline-block',
                animation: player.combo > 0 ? 'bump 150ms ease-out' : 'none',
              }}
            >
              🔥 {player.combo}/{COMBO_THRESHOLD}
            </span>
          )}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          击杀: {player.kills}
        </span>
      </div>

      <GameGrid
        ref={gridRef}
        monsters={player.monsters}
        cannon={player.cannon}
        locked={player.locked}
        playerColor={playerColor}
        onColumnClick={(col) => onMove(side, col)}
        projectiles={projectiles}
        onProjectileDone={removeProjectile}
        escapeEffects={player.escapeEffects}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: '1px',
        height: '3%',
        alignItems: 'center',
      }}>
        {Array.from({ length: COLS }).map((_, c) => (
          <div key={c} style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: c === player.cannon ? playerColor : 'transparent',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="20" height="20" style={{ filter: c === player.cannon ? 'drop-shadow(0px 0px 4px currentColor)' : 'none' }}>
              <rect x="26" y="16" width="12" height="32" fill="none" stroke="currentColor" strokeWidth="3" rx="2"/>
              <path d="M22 16 L42 16 L42 8 L22 8 Z" fill="currentColor" rx="2"/>
              <path d="M14 56 L50 56 L44 40 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <rect x="28" y="46" width="8" height="6" fill="currentColor" rx="1"/>
            </svg>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px 0',
        paddingLeft: '20px',
        paddingRight: '20px',
        height: '12%',
        minHeight: '48px',
      }}>
        {PRIMES.map(p => (
          <PrimeButton
            key={p}
            prime={p}
            disabled={player.locked}
            playerColor={playerColor}
            onFire={handleShoot}
          />
        ))}
      </div>

      {duration > 0 && (() => {
        const progress = Math.max(0, Math.min(1, timeLeft / duration));
        const isUrgent = timeLeft / 1000 <= 10;
        return (
          <div style={{
            padding: '0 20px',
            height: '4px',
          }}>
            <div style={{
              width: '100%',
              height: '3px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: isUrgent ? '#ef4444' : playerColor,
                borderRadius: '2px',
                transition: 'width 0.3s linear',
                opacity: 0.7,
              }} />
            </div>
          </div>
        );
      })()}

      {player.locked && (
        <div style={{
          textAlign: 'center',
          color: '#ef4444',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '2px 0',
        }}>
          🔒 {lockRemaining}s
        </div>
      )}
    </div>
  );
}
