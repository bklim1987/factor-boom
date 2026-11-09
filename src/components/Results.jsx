import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants.js';
import { playVictory } from '../utils/sounds.js';
import { saveScore } from '../utils/scores.js';
import { getAccuracy, accuracyPercent, bonusPercent, killScoreOf, escapeScoreOf, scoreBeforeBonus } from '../utils/accuracy.js';
import BrainUpgrade from './BrainUpgrade.jsx';
import ScoreRoll from './ScoreRoll.jsx';
import ResultActions from './ResultActions.jsx';

const inputStyle = {
  padding: '6px 10px',
  fontSize: '14px',
  backgroundColor: '#263040',
  color: '#e5e7eb',
  border: '1px solid #374151',
  borderRadius: '6px',
  textAlign: 'center',
  width: '140px',
  outline: 'none',
};

function formatDetail(detail) {
  return `${detail.small}+${detail.big}+${detail.boss}`;
}

function StatLine({ label, value, visible, highlight = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ color: highlight ? '#fbbf24' : undefined }}>{label}:</span>
      <span style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-in',
        fontWeight: 'bold',
        color: highlight ? '#fbbf24' : '#e5e7eb',
      }}>
        {value}
      </span>
    </div>
  );
}

function buildStats(player) {
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

export default function Results({ playerA, playerB, nameA, nameB, difficulty, isTournament, onRestart, onBack, onLeaderboard }) {
  const winner = playerA.score > playerB.score ? 'A'
    : playerB.score > playerA.score ? 'B'
    : 'draw';

  const [editNameA, setEditNameA] = useState(nameA);
  const [editNameB, setEditNameB] = useState(nameB);
  const [saved, setSaved] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      playVictory();
    }
  }, []);

  const STAT_COUNT = buildStats(playerA).length;
  useEffect(() => {
    if (revealStep < STAT_COUNT) {
      const timer = setTimeout(() => setRevealStep(s => s + 1), 500);
      return () => clearTimeout(timer);
    }
    const btnTimer = setTimeout(() => setShowButtons(true), 500);
    return () => clearTimeout(btnTimer);
  }, [revealStep]);

  const handleSave = () => {
    const resultA = winner === 'A' ? 'win' : winner === 'B' ? 'lose' : 'draw';
    const resultB = winner === 'B' ? 'win' : winner === 'A' ? 'lose' : 'draw';
    const finalNameA = editNameA.trim() || nameA;
    const finalNameB = editNameB.trim() || nameB;
    saveScore({
      mode: 'duo', difficulty, name: finalNameA, score: playerA.score,
      kills: playerA.kills, maxCombo: playerA.maxCombo,
      missed: playerA.missed, locks: playerA.locks, result: resultA,
    });
    saveScore({
      mode: 'duo', difficulty, name: finalNameB, score: playerB.score,
      kills: playerB.kills, maxCombo: playerB.maxCombo,
      missed: playerB.missed, locks: playerB.locks, result: resultB,
    });
    setSaved(true);
  };

  const cards = [
    { side: 'A', name: editNameA, setName: setEditNameA, player: playerA, color: COLORS.playerA },
    { side: 'B', name: editNameB, setName: setEditNameB, player: playerB, color: COLORS.playerB },
  ];

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
      paddingTop: '5vh',
      paddingBottom: '20px',
      paddingLeft: '20px',
      paddingRight: '20px',
      overflow: 'auto',
    }}>
      <h1 style={{ fontSize: '36px', color: '#fbbf24' }}>⏱ 时间到！</h1>

      {winner !== 'draw' && (
        <h2 style={{ fontSize: '24px', color: '#fbbf24' }}>
          🏆 {winner === 'A' ? editNameA : editNameB} 胜利！
        </h2>
      )}
      {winner === 'draw' && (
        <h2 style={{ fontSize: '24px', color: '#9ca3af' }}>平局！</h2>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {cards.map(({ side, name, setName, player, color }) => {
          const isWinner = winner === side;
          const stats = buildStats(player);
          return (
            <div key={side} style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#1a2234',
              border: `3px solid ${color}`,
              color: color,
              minWidth: '200px',
              textAlign: 'center',
              animation: isWinner ? 'winnerPulse 1.5s ease-in-out infinite' : 'none',
            }}>
              {!isTournament && !saved ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入名字"
                  style={{ ...inputStyle, marginBottom: '8px', color }}
                />
              ) : (
                <div style={{ fontSize: '18px', fontWeight: 'bold', color, marginBottom: '8px' }}>
                  {name}
                </div>
              )}
              <ScoreRoll
                from={scoreBeforeBonus(player)}
                to={player.score}
                roll={revealStep > stats.findIndex((s) => s.highlight)}
                fontSize={36}
              />
              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>小怪+大怪+BOSS</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.8 }}>
                {stats.map((s, i) => (
                  <StatLine key={s.label} label={s.label} value={s.value} visible={i < revealStep} highlight={s.highlight} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showButtons && isTournament && (
        <BrainUpgrade
          cards={[
            { name: editNameA, color: COLORS.playerA, player: playerA },
            { name: editNameB, color: COLORS.playerB, player: playerB },
          ]}
        />
      )}

      {showButtons && !isTournament && (
        <ResultActions
          brainCards={[
            { name: editNameA, color: COLORS.playerA, player: playerA },
            { name: editNameB, color: COLORS.playerB, player: playerB },
          ]}
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
