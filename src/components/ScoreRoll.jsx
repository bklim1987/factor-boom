import { useEffect, useRef, useState } from 'react';

// 奖励行出现之前显示「还没加奖励」的分数；出现之后一格一格跳到最终分。
// 每一步都是介于两者之间的真实整数，不会闪过一个不存在的分数。
// 变了的那一位单独往上跳，所以看起来是数字逐个翻过去。
function plan(from, to) {
  const delta = to - from;
  const distance = Math.abs(delta);
  if (distance === 0) return { steps: 0, gap: 0, delta };
  if (distance <= 24) return { steps: distance, gap: 48, delta };
  return { steps: 16, gap: 55, delta };
}

export default function ScoreRoll({ from, to, roll, fontSize = 48 }) {
  const [value, setValue] = useState(from);
  const [hot, setHot] = useState(false);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!roll) {
      setValue(from);
      setHot(false);
      return undefined;
    }
    if (from === to) {
      setValue(to);
      return undefined;
    }
    const { steps, gap, delta } = plan(from, to);
    setHot(true);
    setValue(from);
    let i = 0;
    let cool = null;
    const id = setInterval(() => {
      i += 1;
      if (i >= steps) {
        setValue(to);
        clearInterval(id);
        cool = setTimeout(() => setHot(false), 700);
        return;
      }
      setValue(Math.round(from + (delta * i) / steps));
    }, gap);
    return () => {
      clearInterval(id);
      if (cool) clearTimeout(cool);
    };
  }, [roll, from, to]);

  const text = String(value);
  const chars = text.split('');
  const prev = prevRef.current;
  useEffect(() => {
    prevRef.current = text;
  });

  return (
    <div
      data-score-roll=""
      style={{
        display: 'flex',
        justifyContent: 'center',
        fontSize,
        fontWeight: 'bold',
        color: hot ? '#fbbf24' : '#fff',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
        marginBottom: '12px',
        transition: 'color 0.5s ease',
      }}
    >
      {chars.map((ch, i) => {
        const prevChars = prev == null ? null : [...prev];
        const changed = prevChars != null && ch !== '-'
          && (prevChars.length !== chars.length || prevChars[i] !== ch);
        return (
          <span
            key={`${chars.length}-${i}-${ch}`}
            style={{
              display: 'inline-block',
              animation: changed ? 'scoreDigit 140ms ease-out' : 'none',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
