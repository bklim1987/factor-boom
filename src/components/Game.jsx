import { useState, useEffect, useCallback, useRef } from 'react';
import { COLORS, DEFAULT_DURATION } from '../utils/constants.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { setMonsterDifficulty } from '../utils/monsters.js';
import PlayerSide from './PlayerSide.jsx';
import Timer from './Timer.jsx';
import Results from './Results.jsx';
import ViewSizeToggle from './ViewSizeToggle.jsx';
import PrimeLayoutToggle from './PrimeLayoutToggle.jsx';
import { loadViewSize, saveViewSize } from '../utils/viewSize.js';
import { loadPrimeLayout, savePrimeLayout } from '../utils/primeLayout.js';
import { playTimeUp } from '../utils/sounds.js';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const rawDuration = parseInt(params.get('duration'));
  const isTournament = params.get('mode') === 'tournament';
  return {
    nameA: params.get('teamA') || params.get('playerA') || '玩家 A',
    nameB: params.get('teamB') || params.get('playerB') || '玩家 B',
    isTournament,
    matchId: params.get('matchId') || '',
    duration: (rawDuration > 0 && Number.isFinite(rawDuration)) ? rawDuration : DEFAULT_DURATION,
  };
}

export default function Game({ difficulty = 'normal', onBack, onLeaderboard }) {
  const { nameA, nameB, matchId, isTournament, duration } = getUrlParams();
  const [, forceUpdate] = useState(0);
  const [endState, setEndState] = useState(null);
  // 画面尺寸：两侧各自独立，上次的选择会被记住
  const [viewSize, setViewSize] = useState(() => ({ A: loadViewSize('A'), B: loadViewSize('B') }));
  const [primeLayout, setPrimeLayout] = useState(loadPrimeLayout);

  const changeViewSize = useCallback((side, size) => {
    setViewSize((prev) => ({ ...prev, [side]: size }));
    saveViewSize(side, size);
  }, []);

  const changePrimeLayout = useCallback((layout) => {
    setPrimeLayout(savePrimeLayout(layout));
  }, []);

  const handleEnd = useCallback((state) => {
    playTimeUp();
    setEndState({ playerA: { ...state.playerA }, playerB: { ...state.playerB } });

    // 已经含准确率奖励的最终分。结算页的滚动是纯展示，上报不能等动画播完。
    const scoreA = state.playerA.score;
    const scoreB = state.playerB.score;
    const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'draw';

    try {
      window.parent.postMessage({
        type: 'tournamentMatchEnd',
        matchId,
        scoreA,
        scoreB,
        winner,
        extra: {
          killsA: state.playerA.kills,
          killsB: state.playerB.kills,
          maxComboA: state.playerA.maxCombo,
          maxComboB: state.playerB.maxCombo,
          missedA: state.playerA.missed,
          missedB: state.playerB.missed,
          locksA: state.playerA.locks,
          locksB: state.playerB.locks,
        },
      }, '*');
    } catch (e) {}
  }, [matchId]);

  const { getState, init, startCountdown, moveCannon, shoot } = useGameLoop(duration, handleEnd);

  const renderRef = useRef(null);

  useEffect(() => {
    // 必须在 init() 之前 —— 开局那 2 只小怪是 init 里就生成的
    setMonsterDifficulty(difficulty);
    init();
    startCountdown();

    renderRef.current = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 50);

    return () => {
      if (renderRef.current) clearInterval(renderRef.current);
    };
  }, [init, startCountdown, difficulty]);

  const state = getState();
  if (!state) return null;

  if (endState) {
    return (
      <Results
        playerA={endState.playerA}
        playerB={endState.playerB}
        nameA={nameA}
        nameB={nameB}
        difficulty={difficulty}
        isTournament={isTournament}
        onRestart={() => {
          setEndState(null);
          init();
          startCountdown();
        }}
        onBack={onBack}
        onLeaderboard={onLeaderboard}
      />
    );
  }

  if (state.phase === 'countdown') {
    // 倒数画面也放尺寸切换：从 tournament hub 进来是直接进游戏的，
    // 这里是比赛开打前唯一能调整的时机（对局中仍可在信息栏随时改）
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
        <div style={{
          fontSize: '96px',
          fontWeight: 'bold',
          color: '#fbbf24',
        }}>
          {state.countdownValue}
        </div>

        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { side: 'A', name: nameA, color: COLORS.playerA },
            { side: 'B', name: nameB, color: COLORS.playerB },
          ].map(({ side, name, color }) => (
            <div key={side} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color }}>{name}</span>
              <ViewSizeToggle
                value={viewSize[side]}
                playerColor={color}
                big
                onChange={(v) => changeViewSize(side, v)}
              />
            </div>
          ))}
        </div>
        <PrimeLayoutToggle
          value={primeLayout}
          playerColor="#fbbf24"
          big
          onChange={changePrimeLayout}
        />
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
          画面尺寸：大屏铺满整个半边；小屏收成手机画面并整体上移，按钮更靠手、左右不用大幅移动。
          <br />按键：窄屏默认两排，减少误触；选「一排」则与大屏相同。够宽时始终一排。
          <br />选择会被记住，对局中也能随时切换。
        </div>
      </div>
    );
  }

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
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <Timer timeLeft={state.timeLeft} />
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
      }}>

      <PlayerSide
        player={state.playerA}
        name={nameA}
        side="A"
        playerColor={COLORS.playerA}
        onMove={moveCannon}
        onShoot={shoot}
        timeLeft={state.timeLeft}
        duration={duration * 1000}
        viewSize={viewSize.A}
        onViewSizeChange={changeViewSize}
        primeLayout={primeLayout}
        onPrimeLayoutChange={changePrimeLayout}
      />

      <div style={{
        width: '2px',
        backgroundColor: '#374151',
        flexShrink: 0,
      }} />

      <PlayerSide
        player={state.playerB}
        name={nameB}
        side="B"
        playerColor={COLORS.playerB}
        onMove={moveCannon}
        onShoot={shoot}
        timeLeft={state.timeLeft}
        duration={duration * 1000}
        viewSize={viewSize.B}
        onViewSizeChange={changeViewSize}
        primeLayout={primeLayout}
        onPrimeLayoutChange={changePrimeLayout}
      />
      </div>
    </div>
  );
}
