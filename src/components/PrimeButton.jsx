import { useState } from 'react';

export default function PrimeButton({ prime, disabled, playerColor, onFire }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) {
          setPressed(true);
          onFire(prime);
        }
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      disabled={disabled}
      style={{
        flex: 1,
        height: '100%',
        minHeight: '48px',
        fontSize: '19px',
        fontWeight: 'bold',
        border: `2px solid ${disabled ? '#555' : playerColor}`,
        borderRadius: '8px',
        backgroundColor: disabled
          ? '#333'
          : pressed
            ? 'rgba(255,255,255,0.15)'
            : '#1a2234',
        color: disabled ? '#666' : playerColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: pressed && !disabled ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.1s, background-color 0.1s, border-color 0.1s',
      }}
    >
      {prime}
    </button>
  );
}
