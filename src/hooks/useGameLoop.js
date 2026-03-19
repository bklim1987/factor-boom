import { useRef, useEffect, useCallback } from 'react';
import { TICK_MS, ROWS, COLS, SPAWN_INTERVAL, LOCK_DURATION, COMBO_THRESHOLD, COMBO_MULTIPLIER, MONSTER_TYPES } from '../utils/constants.js';
import { createMonster } from '../utils/monsters.js';
import { playHit, playMiss, playKill } from '../utils/sounds.js';

function createPlayerState() {
  const p = {
    score: 0,
    monsters: [],
    cannon: 2,
    combo: 0,
    maxCombo: 0,
    mult: 1,
    locked: false,
    lockAcc: 0,
    kills: 0,
    killDetail: { normal: { small: 0, big: 0, boss: 0 }, combo: { small: 0, big: 0, boss: 0 } },
    spawnAcc: 0,
    nextBigAt: 3,
    nextBossAt: 10,
    missed: 0,
    missDetail: { small: 0, big: 0, boss: 0 },
    locks: 0,
    missFlash: 0,
    screenShake: 0,
    escapeEffects: [],
  };

  for (let i = 0; i < 2; i++) {
    const m = createMonster('small', p.monsters);
    p.monsters.push(m);
  }

  return p;
}

export function useGameLoop(duration, onEnd) {
  const stateRef = useRef(null);
  const intervalRef = useRef(null);
  const callbackRef = useRef(onEnd);
  callbackRef.current = onEnd;

  const getState = useCallback(() => stateRef.current, []);

  const init = useCallback(() => {
    stateRef.current = {
      playerA: createPlayerState(),
      playerB: createPlayerState(),
      timeLeft: duration * 1000,
      phase: 'countdown',
      countdownValue: 3,
      countdownAcc: 0,
      running: false,
    };
  }, [duration]);

  const startCountdown = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    s.phase = 'countdown';
    s.countdownValue = 3;
    s.countdownAcc = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tick(), TICK_MS);
  }, []);

  function tickPlayer(p, dt) {
    if (p.locked) {
      p.lockAcc += dt;
      if (p.lockAcc >= LOCK_DURATION) {
        p.locked = false;
        p.lockAcc = 0;
      }
    }

    p.spawnAcc += dt;
    if (p.spawnAcc >= SPAWN_INTERVAL) {
      p.spawnAcc -= SPAWN_INTERVAL;
      const topOccupied = new Set();
      for (const m of p.monsters) {
        if (m.row === 0 && !m.dying) topOccupied.add(m.col);
      }
      if (topOccupied.size < COLS) {
        const monster = createMonster('small', p.monsters);
        p.monsters.push(monster);
      }
    }

    for (let i = p.monsters.length - 1; i >= 0; i--) {
      const m = p.monsters[i];
      if (m.dying) {
        m.dyingAcc += dt;
        if (m.dyingAcc >= 400) {
          p.monsters.splice(i, 1);
        }
        continue;
      }
    }

    const occupied = new Set();
    for (const m of p.monsters) {
      if (!m.dying) occupied.add(`${m.col}-${m.row}`);
    }

    for (let i = p.monsters.length - 1; i >= 0; i--) {
      const m = p.monsters[i];
      if (m.dying) continue;
      m.fallAcc += dt;
      if (m.fallAcc >= m.fallMs) {
        m.fallAcc -= m.fallMs;
        const nextRow = m.row + 1;
        if (nextRow >= ROWS) {
          p.score -= m.pts;
          p.missed += 1;
          p.missDetail[m.type] += 1;
          p.escapeEffects.push({
            id: Date.now() + Math.random(),
            col: m.col,
            pts: m.pts,
            acc: 0,
          });
          occupied.delete(`${m.col}-${m.row}`);
          p.monsters.splice(i, 1);
          continue;
        }
        const nextKey = `${m.col}-${nextRow}`;
        if (!occupied.has(nextKey)) {
          occupied.delete(`${m.col}-${m.row}`);
          m.row = nextRow;
          occupied.add(nextKey);
        } else {
          m.fallAcc = 0;
        }
      }
      if (m.hitFlash > 0) {
        m.hitFlash = Math.max(0, m.hitFlash - dt);
      }
    }

    if (p.missFlash > 0) {
      p.missFlash = Math.max(0, p.missFlash - dt);
    }

    if (p.screenShake > 0) {
      p.screenShake = Math.max(0, p.screenShake - dt);
    }

    for (let i = p.escapeEffects.length - 1; i >= 0; i--) {
      p.escapeEffects[i].acc += dt;
      if (p.escapeEffects[i].acc >= 800) {
        p.escapeEffects.splice(i, 1);
      }
    }

    // 保证画面上始终至少有两只怪兽可打：只剩 1 只时立刻补一只
    if (p.monsters.length === 1) {
      p.monsters.push(createMonster('small', p.monsters));
      p.spawnAcc = 0;
    }
  }

  function tick() {
    const s = stateRef.current;
    if (!s) return;

    if (s.phase === 'countdown') {
      s.countdownAcc += TICK_MS;
      if (s.countdownAcc >= 1000) {
        s.countdownAcc -= 1000;
        s.countdownValue -= 1;
        if (s.countdownValue <= 0) {
          s.phase = 'playing';
          s.running = true;
        }
      }
      return;
    }

    if (s.phase !== 'playing') return;

    s.timeLeft -= TICK_MS;
    if (s.timeLeft <= 0) {
      s.timeLeft = 0;
      s.phase = 'ended';
      s.running = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (callbackRef.current) callbackRef.current(s);
      return;
    }

    tickPlayer(s.playerA, TICK_MS);
    tickPlayer(s.playerB, TICK_MS);
  }

  const moveCannon = useCallback((side, col) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'playing') return;
    const p = side === 'A' ? s.playerA : s.playerB;
    if (p.locked) return;
    p.cannon = col;
  }, []);

  const shoot = useCallback((side, prime) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'playing') return;
    const p = side === 'A' ? s.playerA : s.playerB;
    if (p.locked) return;

    const monstersInCol = p.monsters.filter(m => m.col === p.cannon && !m.dying);
    if (monstersInCol.length === 0) return;

    monstersInCol.sort((a, b) => b.row - a.row);
    const target = monstersInCol[0];

    if (target.value % prime === 0) {
      target.value = target.value / prime;
      target.hitFlash = 300;
      if (target.type === 'boss' && target.value > 1) {
        target.fallMs = 3000;
        target.bossAngered = 0;
      }
      p.combo += 1;
      if (p.combo > p.maxCombo) p.maxCombo = p.combo;
      if (p.combo >= COMBO_THRESHOLD) {
        p.mult = COMBO_MULTIPLIER;
      }

      if (target.value === 1) {
        const earned = Math.round(target.pts * p.mult);
        p.score += earned;
        p.kills += 1;
        const multKey = p.mult > 1 ? 'combo' : 'normal';
        p.killDetail[multKey][target.type] += 1;
        target.dying = true;
        target.dyingAcc = 0;
        playKill(side, target.type === 'boss');

        if (p.kills >= p.nextBossAt) {
          p.nextBossAt += 10;
          const boss = createMonster('boss', p.monsters);
          p.monsters.push(boss);
        }
        if (p.kills >= p.nextBigAt) {
          p.nextBigAt += 3;
          const big = createMonster('big', p.monsters);
          p.monsters.push(big);
        }
      } else {
        playHit(side);
      }
    } else {
      p.locked = true;
      p.lockAcc = 0;
      p.combo = 0;
      p.mult = 1;
      p.locks += 1;
      p.missFlash = 500;
      if (target.type === 'boss') {
        if (target.fallMs >= 3000) {
          target.fallMs = 2000;
        } else if (target.fallMs >= 2000) {
          target.fallMs = 1000;
        }
        target.bossAngered = (target.bossAngered || 0) + 1;
        p.screenShake = 400;
      }
      playMiss(side);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { getState, init, startCountdown, moveCannon, shoot };
}
