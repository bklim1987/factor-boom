import { useState } from 'react';
import { COLORS } from '../utils/constants.js';
import RulesPanel, { useShortScreen } from './RulesPanel.jsx';

// 和结算页同一条宽。下面只有一颗会开局的按钮，
// 难度和模式是嵌在轨道里的切换，点了不会开始游戏。
const COL = 'min(440px, 100%)';

const DIFFICULTY_HINT = {
  easy: '大怪的 7、13 和 BOSS 的 7、11、13 各自最多出现一次',
  normal: '不限制，大怪最大到 13×13×13',
};

const MODE_HINT = {
  solo: '一个人玩，打完可以存成绩',
  duo: '左右分屏，两个人比谁分高',
};

const pressable = {
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

function SettingRow({ label, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        flex: 'none',
        width: '32px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#9ca3af',
      }}>
        {label}
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '2px',
        padding: '3px',
        backgroundColor: '#111827',
        border: '1px solid #263040',
        borderRadius: '9px',
      }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onPointerDown={(e) => { e.preventDefault(); onChange(opt.value); }}
              style={{
                ...pressable,
                flex: '1 1 0',
                minWidth: 0,
                minHeight: '32px',
                padding: '4px 8px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: active ? '#263040' : 'transparent',
                color: active ? opt.color : '#6b7280',
                boxSizing: 'border-box',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Menu({ difficulty = 'normal', onSelectDifficulty, onStartSolo, onStartDuo, onLeaderboard }) {
  const [mode, setMode] = useState('duo');
  const short = useShortScreen();
  const solo = mode === 'solo';

  const start = () => (solo ? onStartSolo() : onStartDuo());

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
      padding: short ? '12px' : '20px',
      gap: short ? '10px' : '16px',
    }}>
      <RulesPanel />

      <div style={{
        width: COL,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 12px 10px',
        borderRadius: '14px',
        backgroundColor: '#121a2b',
        border: '1px solid #263040',
        boxSizing: 'border-box',
      }}>
        <SettingRow
          label="难度"
          value={difficulty}
          onChange={(value) => onSelectDifficulty?.(value)}
          options={[
            { value: 'easy', label: '基础', color: '#fbbf24' },
            { value: 'normal', label: '进阶', color: '#fbbf24' },
          ]}
        />
        <SettingRow
          label="模式"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'solo', label: '单人', color: COLORS.playerA },
            { value: 'duo', label: '双人', color: '#fbbf24' },
          ]}
        />
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45 }}>
          <div>{DIFFICULTY_HINT[difficulty] || DIFFICULTY_HINT.normal}</div>
          <div>{MODE_HINT[mode]}</div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); start(); }}
          style={{
            ...pressable,
            width: '100%',
            minHeight: '42px',
            marginTop: '2px',
            padding: '8px 14px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: solo ? COLORS.playerA : '#fbbf24',
            color: '#111',
            boxSizing: 'border-box',
          }}
        >
          {solo ? '开始单人挑战' : '开始双人对战'}
        </button>
      </div>

      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onLeaderboard(); }}
        style={{
          ...pressable,
          marginTop: '-6px',
          padding: '4px 10px',
          fontSize: '13px',
          backgroundColor: 'transparent',
          color: '#6b7280',
          border: 'none',
        }}
      >
        查看排行榜
      </button>
    </div>
  );
}
