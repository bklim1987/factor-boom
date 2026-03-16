import { useState, useEffect, useCallback, useRef } from 'react';
import { PRIMES, COLS, ROWS, COLORS, COMBO_THRESHOLD, LOCK_DURATION, DEFAULT_DURATION, PROJECTILE_FLIGHT_MS } from '../utils/constants.js';
import { useSoloGameLoop } from '../hooks/useSoloGameLoop.js';
import { saveScore } from '../utils/scores.js';
import { playVictory } from '../utils/sounds.js';
import GameGrid from './GameGrid.jsx';
import PrimeButton from './PrimeButton.jsx';
import Timer from './Timer.jsx';

function formatDetail(detail) {
  return `${detail.small}+${detail.big}+${detail.boss}`;
}

function buildSoloStats(player) {
  const kd = player.killDetail || { normal: { small: 0, big: 0, boss: 0 }, combo: { small: 0, big: 0, boss: 0 } };
  const md = player.missDetail || { small: 0, big: 0, boss: 0 };
  return [
    { label: 'x1.0击杀', value: formatDetail(kd.normal) },
    { label: 'x1.5击杀', value: formatDetail(kd.combo) },
    { label: '逃脱', value: formatDetail(md) },
    { label: '误击', value: player.locks },
  ];
}

function SoloResults({ player, onRestart, onBack, onLeaderboard }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [revealStep, setRevealStep] = useState(0);

  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      playVictory();
    }
  }, []);

  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (revealStep < 4) {
      const timer = setTimeout(() => setRevealStep(s => s + 1), 500);
      return () => clearTimeout(timer);
    }
    const btnTimer = setTimeout(() => setShowButtons(true), 500);
    return () => clearTimeout(btnTimer);
  }, [revealStep]);

  const handleSave = () => {
    const finalName = name.trim() || '单人挑战';
    saveScore({
      mode: 'solo',
      name: finalName,
      score: player.score,
      kills: player.kills,
      maxCombo: player.maxCombo,
      missed: player.missed,
      locks: player.locks,
      result: 'solo',
    });
    setSaved(true);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: COLORS.bg,
      color: '#e5e7eb',
      gap: '16px',
      paddingTop: '8vh',
      paddingBottom: '20px',
      paddingLeft: '20px',
      paddingRight: '20px',
      overflow: 'auto',
    }}>
      <h1 style={{ fontSize: '32px', color: '#fbbf24' }}>挑战结束！</h1>

      <div style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#1a2234',
        border: `3px solid ${COLORS.playerA}`,
        color: COLORS.playerA,
        minWidth: '200px',
        textAlign: 'center',
        animation: 'winnerPulse 1.5s ease-in-out infinite',
      }}>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>得分</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
          {player.score}
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>小怪+大怪+BOSS</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.8 }}>
          {buildSoloStats(player).map((s, i) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span>{s.label}:</span>
              <span style={{
                opacity: i < revealStep ? 1 : 0,
                transition: 'opacity 0.3s ease-in',
                fontWeight: 'bold',
                color: '#e5e7eb',
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showButtons && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.4s ease-in',
        }}>
          {!saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入名字（可选）"
                style={{
                  padding: '8px 12px',
                  fontSize: '16px',
                  backgroundColor: '#263040',
                  color: '#e5e7eb',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  textAlign: 'center',
                  width: '200px',
                  outline: 'none',
                }}
              />
              <button
                onPointerDown={(e) => { e.preventDefault(); handleSave(); }}
                style={{
                  padding: '12px 36px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  minHeight: '50px',
                }}
              >
                保存成绩
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>成绩已保存</div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onPointerDown={(e) => { e.preventDefault(); onRestart(); }}
              style={{
                padding: '14px 36px',
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
              再来一局
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); onBack(); }}
              style={{
                padding: '14px 36px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '2px solid #374151',
                borderRadius: '12px',
                cursor: 'pointer',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                minHeight: '52px',
              }}
            >
              返回主页
            </button>
          </div>
          {onLeaderboard && (
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
              查看排行榜
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SoloGame({ onBack, onLeaderboard }) {
  const [, forceUpdate] = useState(0);
  const [endState, setEndState] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const gridRef = useRef(null);

  const duration = DEFAULT_DURATION;

  const handleEnd = useCallback((state) => {
    setEndState({ player: { ...state.player } });
  }, []);

  const { getState, init, startCountdown, moveCannon, shoot } = useSoloGameLoop(duration, handleEnd);

  const renderRef = useRef(null);

  useEffect(() => {
    init();
    startCountdown();
    renderRef.current = setInterval(() => forceUpdate(n => n + 1), 50);
    return () => { if (renderRef.current) clearInterval(renderRef.current); };
  }, [init, startCountdown]);


  const state = getState();
  if (!state) return null;

  if (endState) {
    return (
      <SoloResults
        player={endState.player}
        onLeaderboard={onLeaderboard}
        onRestart={() => {
          setEndState(null);
          setProjectiles([]);
          init();
          startCountdown();
        }}
        onBack={onBack}
      />
    );
  }

  if (state.phase === 'countdown') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
      }}>
        <div style={{ fontSize: '96px', fontWeight: 'bold', color: '#fbbf24' }}>
          {state.countdownValue}
        </div>
      </div>
    );
  }

  const player = state.player;
  const comboActive = player.mult > 1;

  const lockRemaining = player.locked
    ? Math.max(0, (LOCK_DURATION - player.lockAcc) / 1000).toFixed(1)
    : 0;

  const handleShoot = (prime) => {
    shoot(prime);

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
      prime, startX, startY, endX: startX, endY, hit,
      col, addedAt: Date.now(),
    }]);
  };

  const removeProjectile = (id) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.bg,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        color: COLORS.playerA,
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        <span style={{ fontSize: '18px' }}>
          <span style={{
            color: comboActive ? '#fbbf24' : COLORS.playerA,
            textShadow: comboActive ? '0 0 12px rgba(251,191,36,0.8)' : 'none',
          }}>
            {player.score}
          </span>
        </span>
        <Timer timeLeft={state.timeLeft} />
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
              {player.combo}/{COMBO_THRESHOLD}
            </span>
          )}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          击杀: {player.kills}
        </span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 4px',
        minHeight: 0,
        position: 'relative',
        backgroundColor: player.missFlash > 0 ? 'rgba(239,68,68,0.2)' : 'transparent',
        transition: 'background-color 0.15s',
        animation: player.screenShake > 0 ? 'screenShake 0.4s ease-in-out' : 'none',
      }}>
        <GameGrid
          ref={gridRef}
          monsters={player.monsters}
          cannon={player.cannon}
          locked={player.locked}
          playerColor={COLORS.playerA}
          onColumnClick={(col) => moveCannon(col)}
          projectiles={projectiles.map(p => ({
            ...p,
            progress: Math.min(1, (Date.now() - (p.addedAt ?? 0)) / PROJECTILE_FLIGHT_MS),
          }))}
          onProjectileDone={removeProjectile}
          escapeEffects={player.escapeEffects}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '1px',
          height: '24px',
          alignItems: 'center',
        }}>
          {Array.from({ length: COLS }).map((_, c) => (
            <div key={c} style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: c === player.cannon ? COLORS.playerA : 'transparent',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="24" height="24" style={{ filter: c === player.cannon ? 'drop-shadow(0px 0px 4px currentColor)' : 'none' }}>
                <rect x="26" y="16" width="12" height="32" fill="none" stroke="currentColor" strokeWidth="3" rx="2"/>
                <path d="M22 16 L42 16 L42 8 L22 8 Z" fill="currentColor" rx="2"/>
                <path d="M14 56 L50 56 L44 40 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                <rect x="28" y="46" width="8" height="6" fill="currentColor" rx="1"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '6px 12px',
        paddingBottom: '20px',
        minHeight: '60px',
      }}>
        {PRIMES.map(p => (
          <PrimeButton
            key={p}
            prime={p}
            disabled={player.locked}
            playerColor={COLORS.playerA}
            onFire={handleShoot}
          />
        ))}
      </div>

      {(() => {
        const progress = Math.max(0, Math.min(1, state.timeLeft / (duration * 1000)));
        const isUrgent = state.timeLeft / 1000 <= 10;
        return (
          <div style={{
            padding: '0 12px',
            height: '5px',
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
                backgroundColor: isUrgent ? '#ef4444' : COLORS.playerA,
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
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '4px 0 12px',
        }}>
          🔒 {lockRemaining}s
        </div>
      )}
    </div>
  );
}
