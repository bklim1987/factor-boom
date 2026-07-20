import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants.js';
import { setMonsterValueSeed } from '../utils/monsters.js';
import SoloGame from './SoloGame.jsx';
import RulesPanel from './RulesPanel.jsx';

// ============================================================
// ArenaGame —— Arena 平台（arena.bklim.app）契约适配层
// ============================================================
// 进入方式：URL 带 ?mode=arena（App.jsx 路由）。
// 与平台只通过 postMessage 通信，遵循 arena-spec.md §3 契约：
//   平台 → 游戏：arena:init {seed, mode} / arena:start {serverNow, startAt, endAt} / arena:end
//   游戏 → 平台：arena:ready {manifest} / arena:event {kind:'score', amount(可负)} / arena:finish
// 玩法本体是原封不动的 SoloGame（单人挑战）——体感与原版完全一致。
// 数值公平：seed 灌进 monsters.js 的确定性数值流，人人打到的
// 第 N 只小怪/大怪/BOSS 数值相同；落点随各自战局。
// ============================================================

const PROTOCOL_VERSION = 1;

const MANIFEST = {
  v: PROTOCOL_VERSION,
  gameId: 'factor-boom',
  scoreType: 'points',      // 积分型：分数累积，实时排名
  scoreDirection: 'desc',   // 分越高越好
  scoreFormat: 'number',
  supportsInteraction: false, // 互动层（steal/swap/…）后续再开
  extraFields: ['kills'],
  ownsSettlement: true,   // 本游戏自带结算卡，平台练习页不必兜底
};

export default function ArenaGame() {
  const [phase, setPhase] = useState('waiting'); // waiting → playing → frozen
  const [gameKey, setGameKey] = useState(0);
  const [durationSec, setDurationSec] = useState(60);
  const [isPractice, setIsPractice] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const platformRef = useRef({ win: null, origin: '*' });
  const statsRef = useRef({ score: 0, kills: 0 });
  const finishedRef = useRef(false);
  const frozenRef = useRef(false);

  function postToPlatform(msg) {
    const { win, origin } = platformRef.current;
    const target = win || window.parent;
    try { target.postMessage({ v: PROTOCOL_VERSION, ...msg }, origin); }
    catch (_) { try { window.parent.postMessage({ v: PROTOCOL_VERSION, ...msg }, '*'); } catch (__) {} }
  }

  useEffect(() => {
    function onMessage(e) {
      const m = e.data || {};
      switch (m.type) {
        case 'arena:init': {
          platformRef.current = {
            win: e.source || window.parent,
            origin: e.origin && e.origin !== 'null' ? e.origin : '*',
          };
          setIsPractice(m.mode === 'practice');
          setMonsterValueSeed(m.seed); // 数值序列人人相同（公平核心）
          frozenRef.current = false;
          setShowRules(false);
          setPhase('waiting');
          setGameKey((k) => k + 1);
          postToPlatform({ type: 'arena:ready', manifest: MANIFEST });
          break;
        }
        case 'arena:start': {
          // 时长跟平台走：endAt - serverNow；练习模式 endAt 为 null → 经典 60 秒
          if (typeof m.endAt === 'number' && typeof m.serverNow === 'number') {
            setDurationSec(Math.max(5, Math.round((m.endAt - m.serverNow) / 1000)));
          } else {
            setDurationSec(60);
          }
          finishedRef.current = false;
          frozenRef.current = false;
          setPhase('playing');
          break;
        }
        case 'arena:end':
          frozenRef.current = true;
          setPhase('frozen'); // 平台宣布结束：冻结输入与报分，不渲染游戏自带结算 UI
          break;
        default:
          break;
      }
    }
    window.addEventListener('message', onMessage);
    // 补发 React 挂载前平台就发来的消息（早期缓冲，见 src/index.jsx）
    window.__arenaLive = true;
    const buffered = (window.__arenaBuf || []).splice(0);
    buffered.forEach(onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const arenaHooks = {
    durationSec,
    practice: isPractice,
    onScoreDelta: (delta) => {
      if (frozenRef.current) return;
      statsRef.current.score += delta;
      setLastScore(statsRef.current.score);
      // 只报事件不报总分 —— 账本在平台（arena-spec §3.2）
      postToPlatform({ type: 'arena:event', kind: 'score', amount: delta });
    },
    onLocalEnd: ({ score, kills }) => {
      statsRef.current = { score, kills };
      setLastScore(score);
      // 练习模式：本地时间到 = 本局结束，报 finish 给练习页记成绩。
      // 比赛模式不报 finish —— 积分型由平台在 endAt 统一收场。
      if (isPractice && !finishedRef.current) {
        finishedRef.current = true;
        postToPlatform({ type: 'arena:finish', extra: { score, kills } });
      }
    },
  };

  if (phase === 'waiting') {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '12px',
        backgroundColor: COLORS.bg, color: '#9ca3af', fontSize: '16px',
      }}>
        <div style={{ fontSize: '40px' }}>💣</div>
        <div>因数爆破 · 待命中…</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      pointerEvents: phase === 'frozen' ? 'none' : 'auto',
    }}>
      <SoloGame key={gameKey} arena={arenaHooks} />
      {phase === 'playing' && isPractice && (
        <>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setShowRules(true); }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 5,
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(26,34,52,0.92)',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            📖 玩法
          </button>
          {showRules && (
            <div
              onPointerDown={() => setShowRules(false)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(11,17,32,0.75)',
                padding: '16px',
                overflow: 'auto',
              }}
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  maxWidth: '520px',
                  width: '100%',
                  padding: '24px 20px',
                  borderRadius: '12px',
                  backgroundColor: COLORS.bg,
                  color: '#e5e7eb',
                }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); setShowRules(false); }}
                  aria-label="关闭"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    padding: '4px 8px',
                    fontSize: '18px',
                    lineHeight: 1,
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  ✕
                </button>
                <RulesPanel />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
