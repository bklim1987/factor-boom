import { useEffect, useState } from 'react';
import { MONSTER_TYPES } from '../utils/constants.js';

const monsterPreviews = [
  { type: 'small', name: '小怪', factors: '2个质因数', pts: '100分' },
  { type: 'big', name: '大怪', factors: '3个质因数', pts: '200分' },
  { type: 'boss', name: 'BOSS', factors: '5个质因数', pts: '500分' },
];

// 矮屏幕（旧手机、横过来的手机）装不下整页，标题和说明收一档，开始按钮才不会被切掉
// 844 高的手机刚好放下宽松排版；再矮一档就收紧，避免开始按钮被切掉
const SHORT_QUERY = '(max-height: 820px)';

export function useShortScreen() {
  const [short, setShort] = useState(() => window.matchMedia(SHORT_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(SHORT_QUERY);
    const update = () => setShort(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return short;
}

function PreviewSmall({ config }) {
  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: config.color.bg,
      border: `2px solid ${config.color.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      margin: '8px auto 4px',
    }}>
      <div style={{
        position: 'absolute',
        top: '-5px',
        left: '22%',
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        backgroundColor: config.color.border,
      }} />
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '22%',
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        backgroundColor: config.color.border,
      }} />
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: config.color.text }}>6</div>
    </div>
  );
}

function PreviewBig({ config }) {
  return (
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '6px',
      backgroundColor: config.color.bg,
      border: `2px solid ${config.color.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      margin: '8px auto 4px',
    }}>
      <div style={{
        position: 'absolute',
        top: '-7px',
        left: '18%',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: `7px solid ${config.color.border}`,
      }} />
      <div style={{
        position: 'absolute',
        top: '-7px',
        right: '18%',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: `7px solid ${config.color.border}`,
      }} />
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: config.color.text }}>30</div>
    </div>
  );
}

function PreviewBoss({ config }) {
  return (
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '6px',
      backgroundColor: config.color.bg,
      border: `2px solid ${config.color.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      margin: '8px auto 4px',
      animation: 'bossFlicker 0.8s step-end infinite',
    }}>
      <div style={{
        position: 'absolute',
        top: '-9px',
        left: '14%',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: `9px solid ${config.color.border}`,
      }} />
      <div style={{
        position: 'absolute',
        top: '-11px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: `11px solid ${config.color.border}`,
      }} />
      <div style={{
        position: 'absolute',
        top: '-9px',
        right: '14%',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: `9px solid ${config.color.border}`,
      }} />
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: config.color.text }}>210</div>
    </div>
  );
}

export default function RulesPanel() {
  const short = useShortScreen();
  return (
    <>
      <h1 style={{ fontSize: short ? '46px' : '56px', fontWeight: 'bold', color: '#fbbf24', lineHeight: 1.1 }}>
        因数爆破
      </h1>
      <p style={{ fontSize: short ? '26px' : '34px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '-2px' }}>Factor Boom!</p>

      <div style={{
        width: 'min(440px, 100%)',
        textAlign: 'center',
        fontSize: short ? '17px' : '20px',
        lineHeight: short ? 1.55 : 1.7,
        color: '#d1d5db',
      }}>
        <p>🎯 点击列(column)瞬移大炮</p>
        <p>🔢 点击质因数分解怪物</p>
        <p>❌ 误击将封锁操作1秒</p>
        <p>🔥 连续命中10次 → 1.5x 得分!</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        width: 'min(440px, 100%)',
      }}>
        {monsterPreviews.map(mp => {
          const config = MONSTER_TYPES[mp.type];
          return (
            <div key={mp.type} style={{
              flex: '1 1 0',
              minWidth: 0,
              padding: '4px 8px 12px',
              borderRadius: '12px',
              backgroundColor: '#1a2234',
              border: `2px solid ${config.color.border}`,
              textAlign: 'center',
            }}>
              {mp.type === 'small' && <PreviewSmall config={config} />}
              {mp.type === 'big' && <PreviewBig config={config} />}
              {mp.type === 'boss' && <PreviewBoss config={config} />}
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: config.color.text }}>
                {mp.name}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.35 }}>
                <div>{mp.factors}</div>
                <div>{mp.pts}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
