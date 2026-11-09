import { useState } from 'react';
import { COLORS } from '../utils/constants.js';
import { getScores, clearScores, recordDifficulty } from '../utils/scores.js';

export default function Leaderboard({ onBack }) {
  const [tab, setTab] = useState('all');
  const [diffTab, setDiffTab] = useState('all');
  const [, forceUpdate] = useState(0);

  const mode = tab === 'all' ? null : tab;
  const difficulty = diffTab === 'all' ? null : diffTab;
  const scores = getScores(mode, difficulty);

  const pillStyle = (active) => ({
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: active ? '#fbbf24' : '#1a2234',
    color: active ? '#000' : '#9ca3af',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  });

  const tabStyle = (t) => pillStyle(tab === t);
  const diffTabStyle = (t) => pillStyle(diffTab === t);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: COLORS.bg,
      color: '#e5e7eb',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h1 style={{ fontSize: '24px', color: '#fbbf24' }}>排行榜</h1>
        <button
          onPointerDown={(e) => { e.preventDefault(); onBack(); }}
          style={{
            padding: '8px 20px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            border: '2px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          返回
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onPointerDown={(e) => { e.preventDefault(); setTab('all'); }} style={tabStyle('all')}>全部</button>
        <button onPointerDown={(e) => { e.preventDefault(); setTab('solo'); }} style={tabStyle('solo')}>单人</button>
        <button onPointerDown={(e) => { e.preventDefault(); setTab('duo'); }} style={tabStyle('duo')}>双人</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onPointerDown={(e) => { e.preventDefault(); setDiffTab('all'); }} style={diffTabStyle('all')}>全部难度</button>
        <button onPointerDown={(e) => { e.preventDefault(); setDiffTab('easy'); }} style={diffTabStyle('easy')}>基础</button>
        <button onPointerDown={(e) => { e.preventDefault(); setDiffTab('normal'); }} style={diffTabStyle('normal')}>进阶</button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {scores.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px', fontSize: '16px' }}>
            暂无记录
          </div>
        )}

        {scores.map((record, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            backgroundColor: i % 2 === 0 ? '#1a2234' : 'transparent',
            borderRadius: '6px',
          }}>
            <div style={{
              width: '28px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: i < 3 ? '#fbbf24' : '#6b7280',
              textAlign: 'center',
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#e5e7eb',
              }}>
                {record.name}
                <span style={{
                  marginLeft: '8px',
                  fontSize: '11px',
                  color: record.mode === 'solo' ? COLORS.playerA : '#9ca3af',
                  fontWeight: 'normal',
                }}>
                  {record.mode === 'solo' ? '单人' : '双人'}
                  {record.result === 'win' && ' 胜'}
                  {record.result === 'lose' && ' 负'}
                  {record.result === 'draw' && ' 平'}
                </span>
                <span style={{
                  marginLeft: '6px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  backgroundColor: recordDifficulty(record) === 'easy' ? '#064e3b' : '#312e81',
                  color: recordDifficulty(record) === 'easy' ? '#6ee7b7' : '#a5b4fc',
                }}>
                  {recordDifficulty(record) === 'easy' ? '基础' : '进阶'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                击杀:{record.kills} 连击:{record.maxCombo} 漏:{record.missed}
              </div>
              {record.date && (
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '1px' }}>
                  {new Date(record.date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#fff',
            }}>
              {record.score}
            </div>
          </div>
        ))}
      </div>

      {scores.length > 0 && (
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            if (confirm('确定要清除所有记录吗？')) {
              clearScores();
              forceUpdate(n => n + 1);
            }
          }}
          style={{
            marginTop: '12px',
            padding: '10px',
            fontSize: '13px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          清除所有记录
        </button>
      )}
    </div>
  );
}
