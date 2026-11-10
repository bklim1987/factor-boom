import { useState, useEffect, useCallback, useRef } from 'react';
import { PRIMES, COLS, ROWS, COLORS, COMBO_THRESHOLD, LOCK_DURATION, DEFAULT_DURATION, PROJECTILE_FLIGHT_MS } from '../utils/constants.js';
import { useSoloGameLoop } from '../hooks/useSoloGameLoop.js';
import { saveScore } from '../utils/scores.js';
import { setMonsterDifficulty } from '../utils/monsters.js';
import { playTimeUp, playVictory } from '../utils/sounds.js';
import GameGrid from './GameGrid.jsx';
import PrimeButton from './PrimeButton.jsx';
import Timer from './Timer.jsx';
import ViewSizeToggle from './ViewSizeToggle.jsx';
import { loadViewSize, saveViewSize, viewSizeStyle } from '../utils/viewSize.js';
import { getAccuracy, accuracyPercent, bonusPercent, killScoreOf, escapeScoreOf, scoreBeforeBonus } from '../utils/accuracy.js';
import BrainUpgrade from './BrainUpgrade.jsx';
import ScoreRoll, { rollDurationMs } from './ScoreRoll.jsx';
import ResultActions from './ResultActions.jsx';

function formatDetail(detail) {
  return `${detail.small}+${detail.big}+${detail.boss}`;
}

function buildSoloStats(player) {
  const kd = player.killDetail || { normal: { small: 0, big: 0, boss: 0 }, combo: { small: 0, big: 0, boss: 0 } };
  const md = player.missDetail || { small: 0, big: 0, boss: 0 };
  const acc = getAccuracy(player);
  return [
    { label: 'x1.0击杀', value: formatDetail(kd.normal) },
    { label: 'x1.5击杀', value: formatDetail(kd.combo) },
    { label: '逃脱', value: `${formatDetail(md)} (-${escapeScoreOf(player)}分)` },
    { label: '误击', value: player.locks },
    { label: '击杀得分', value: killScoreOf(player) },
    { label: '准确率', value: acc.shots > 0 ? `${accuracyPercent(player)}% (${acc.hits}对${acc.misses}错)` : '—' },
    {
      label: '准确率奖励',
      value: `击杀分×${bonusPercent(player)}% = +${player.accuracyBonus || 0}分`,
      highlight: true,
    },
  ];
}

const soloResultScreenStyle = {
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
};

function SoloResultCard({ player, footer = null, onStatsRevealed = null }) {
  const [revealStep, setRevealStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const stats = buildSoloStats(player);
  const bonusAt = stats.findIndex((s) => s.highlight);
  const rollMs = rollDurationMs(scoreBeforeBonus(player), player.score);

  useEffect(() => {
    if (revealStep < stats.length) {
      const timer = setTimeout(() => setRevealStep(s => s + 1), 500);
      return () => clearTimeout(timer);
    }
    // 明细播完、分数也跳到最终分，边框才开始闪
    const timer = setTimeout(() => {
      setCelebrating(true);
      onStatsRevealed?.();
    }, rollMs + 400);
    return () => clearTimeout(timer);
  }, [revealStep, stats.length, rollMs, onStatsRevealed]);

  const played = useRef(false);
  useEffect(() => {
    if (!celebrating || played.current) return undefined;
    played.current = true;
    playVictory();
    return undefined;
  }, [celebrating]);

  return (
    <>
      <h1 style={{ fontSize: '32px', color: '#fbbf24' }}>挑战结束！</h1>

      <div style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#1a2234',
        border: `3px solid ${COLORS.playerA}`,
        color: COLORS.playerA,
        minWidth: '200px',
        textAlign: 'center',
        animation: celebrating ? 'winnerPulse 1.5s ease-in-out infinite' : 'none',
      }}>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>得分</div>
        <ScoreRoll
          from={scoreBeforeBonus(player)}
          to={player.score}
          roll={revealStep > bonusAt}
          fontSize={48}
        />
        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>小怪+大怪+BOSS</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.8 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: s.highlight ? '#fbbf24' : undefined }}>{s.label}:</span>
              <span style={{
                opacity: i < revealStep ? 1 : 0,
                transition: 'opacity 0.3s ease-in',
                fontWeight: 'bold',
                color: s.highlight ? '#fbbf24' : '#e5e7eb',
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {footer}
    </>
  );
}

function SoloResults({ player, difficulty, onRestart, onBack, onLeaderboard }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const handleStatsRevealed = useCallback(() => setShowButtons(true), []);

  const handleSave = () => {
    const finalName = name.trim() || '单人挑战';
    saveScore({
      mode: 'solo',
      difficulty,
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
    <div style={soloResultScreenStyle}>
      <SoloResultCard
        player={player}
        onStatsRevealed={handleStatsRevealed}
      />

      {showButtons && (
        <ResultActions
          brainCards={[{ color: COLORS.playerA, player }]}
          name={name}
          onNameChange={setName}
          saved={saved}
          onSave={handleSave}
          onRestart={onRestart}
          onBack={onBack}
          onLeaderboard={onLeaderboard}
        />
      )}
    </div>
  );
}

export default function SoloGame({ difficulty = 'normal', onBack, onLeaderboard, arena = null }) {
  // arena（可选）：Arena 平台模式的钩子，不传则一切照旧（solo/duo 零改动）。
  //   { durationSec, onScoreDelta(delta), onLocalEnd({score,kills}) }
  //   平台模式下：时长来自平台、跳过自带 3-2-1（平台已经数过）、
  //   分数按增量上报（含逃脱的负分）、结束页换成等待结算的简单画面。
  const [, forceUpdate] = useState(0);
  const [endState, setEndState] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const gridRef = useRef(null);
  // 画面尺寸：大屏上缩成手机荧幕更好操控；选择会被记住
  const [viewSize, setViewSize] = useState(() => loadViewSize('solo'));

  const changeViewSize = useCallback((size) => {
    setViewSize(size);
    saveViewSize('solo', size);
  }, []);

  const duration = arena?.durationSec || DEFAULT_DURATION;

  const arenaRef = useRef(arena);
  arenaRef.current = arena;

  // 平台模式的对账游标：定时对账和局末补报共用，避免同一笔分数报两次
  const lastReportedRef = useRef(0);
  // getState 来自下面的钩子，而钩子要先吃掉 handleEnd，只能用 ref 回指
  const getStateRef = useRef(null);

  const flushArenaScore = useCallback(() => {
    if (!arenaRef.current) return;
    const s = getStateRef.current?.();
    if (!s || !s.player) return;
    const sc = s.player.score;
    if (sc !== lastReportedRef.current) {
      arenaRef.current.onScoreDelta?.(sc - lastReportedRef.current);
      lastReportedRef.current = sc;
    }
  }, []);

  const handleEnd = useCallback((state) => {
    playTimeUp();
    setEndState({ player: { ...state.player } });
    if (arenaRef.current) {
      // 先补报一次：准确率奖励是局末才加到总分上的，而平台可能在同一刻
      // 发来 arena:end 冻结报分，等下一次 100ms 对账就来不及了。
      // 这里的 score 是加完奖励的最终分。结算页上的数字滚动只是展示，不能推迟这笔上报。
      flushArenaScore();
      arenaRef.current.onLocalEnd?.({ score: state.player.score, kills: state.player.kills });
    }
  }, [flushArenaScore]);

  const { getState, init, startCountdown, moveCannon, shoot } = useSoloGameLoop(duration, handleEnd);
  getStateRef.current = getState;

  const renderRef = useRef(null);

  useEffect(() => {
    // 必须在 init() 之前 —— 开局那 2 只小怪是 init 里就生成的
    setMonsterDifficulty(difficulty);
    init();
    startCountdown();
    if (arenaRef.current) {
      // 平台模式：挂载即开打（本组件在 arena:start 之后才被挂载，
      // 平台的 3·2·1 已经数完，不再重复游戏自带的倒数）
      const s = getState();
      if (s) { s.phase = 'playing'; s.running = true; }
    }
    renderRef.current = setInterval(() => forceUpdate(n => n + 1), 50);
    return () => { if (renderRef.current) clearInterval(renderRef.current); };
  }, [init, startCountdown, getState, difficulty]);

  // 平台模式：每 100ms 对账一次，把分数「增量」报给平台（含负分——怪逃脱扣分）。
  //
  // ⚠ 依赖数组只放 getState（稳定），绝不放 arena！
  //   ArenaGame 每次渲染都新建 arenaHooks 对象，且每报一次分就 setLastScore→重渲染。
  //   若把 arena 放进依赖，本 effect 会随之反复拆装：定时器每次重建，闭包里的 last 归零，
  //   下一拍就把「当前总分」当增量重报一遍 → 平台分每 100ms 翻涌暴走（-800 报成 -97100）。
  //   回调本就走 arenaRef.current，无需 arena 进依赖。装一次、游标常驻，才对得上账。
  //   游标现在放在 lastReportedRef 里（原本是闭包里的 last），好让局末的
  //   flushArenaScore 和这里共用同一笔账，奖励不会被报两遍。
  useEffect(() => {
    if (!arenaRef.current) return; // 非平台模式（solo/duo）不上报
    lastReportedRef.current = 0;
    const t = setInterval(flushArenaScore, 100);
    return () => clearInterval(t);
  }, [flushArenaScore]);


  const state = getState();
  if (!state) return null;

  if (endState) {
    if (arena) {
      return (
        <div style={soloResultScreenStyle}>
          <SoloResultCard
            player={endState.player}
            footer={(
              <>
                <BrainUpgrade cards={[{ color: COLORS.playerA, player: endState.player }]} />
                {!arena.practice && (
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>等待全场结算…</div>
                )}
              </>
            )}
          />
        </div>
      );
    }
    return (
      <SoloResults
        player={endState.player}
        difficulty={difficulty}
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        backgroundColor: COLORS.bg,
        padding: '20px',
      }}>
        <div style={{ fontSize: '96px', fontWeight: 'bold', color: '#fbbf24' }}>
          {state.countdownValue}
        </div>
        <ViewSizeToggle
          value={viewSize}
          playerColor={COLORS.playerA}
          big
          onChange={changeViewSize}
        />
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
          选「小屏」可把画面收成手机大小并整体上移，按钮更靠手、左右不用大幅移动。
          <br />选择会被记住，对局中也能随时切换。
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
        alignItems: 'center',
        // 靠上对齐：紧凑模式下空白留在下方，按钮整体上移
        justifyContent: 'flex-start',
        backgroundColor: COLORS.bg,
      }}
    >
      <div style={viewSizeStyle(viewSize)}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        color: COLORS.playerA,
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        <ViewSizeToggle
          value={viewSize}
          playerColor={COLORS.playerA}
          onChange={changeViewSize}
        />
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
        gap: '10px',
        padding: '6px 4px',
        paddingBottom: '20px',
        minHeight: '72px',
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
            padding: '0 4px',
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
    </div>
  );
}
