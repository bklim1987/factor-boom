import { MONSTER_TYPES } from '../utils/constants.js';

const monsterPreviews = [
  { type: 'small', name: '小怪', desc: '2个质因数，100分' },
  { type: 'big', name: '大怪', desc: '3个质因数，200分' },
  { type: 'boss', name: 'BOSS', desc: '5个质因数，500分' },
];

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
  return (
    <>
      <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#fbbf24' }}>
        因数爆破
      </h1>
      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '-4px' }}>Factor Boom!</p>

      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        fontSize: '14px',
        lineHeight: 1.8,
        color: '#d1d5db',
      }}>
        <p>🎯 点击列(column)瞬移大炮</p>
        <p>🔢 点击质因数分解怪物</p>
        <p>❌ 误击将封锁操作1秒</p>
        <p>🔥 连续命中10次 → 1.5x 得分!</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {monsterPreviews.map(mp => {
          const config = MONSTER_TYPES[mp.type];
          return (
            <div key={mp.type} style={{
              padding: '8px 20px 12px',
              borderRadius: '8px',
              backgroundColor: '#1a2234',
              border: `2px solid ${config.color.border}`,
              textAlign: 'center',
              minWidth: '120px',
            }}>
              {mp.type === 'small' && <PreviewSmall config={config} />}
              {mp.type === 'big' && <PreviewBig config={config} />}
              {mp.type === 'boss' && <PreviewBoss config={config} />}
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: config.color.text }}>
                {mp.name}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                {mp.desc}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
