let ctx = null;
// 上下文还在 suspended（要等用户手势才真正出声）时，currentTime 是冻住的。
// 这时如果两声都约在「现在」，等它恢复会一起响。先按真实点击间隔排好队。
const queued = [];
let resumeTask = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function flush(c) {
  if (c.state !== 'running' || queued.length === 0) return;
  const batch = queued.splice(0);
  const baseWall = batch[0].requestedAt;
  const baseAudio = c.currentTime;
  for (const item of batch) {
    const offset = Math.min(1, Math.max(0, (item.requestedAt - baseWall) / 1000));
    item.build(c, baseAudio + offset);
  }
}

function playWhenReady(build) {
  const c = getCtx();
  if (c.state === 'running') {
    build(c, c.currentTime);
    return;
  }
  queued.push({ build, requestedAt: performance.now() });
  if (!resumeTask) {
    resumeTask = c.resume().then(() => {
      resumeTask = null;
      flush(c);
    }).catch(() => {
      resumeTask = null;
    });
  }
}

// 尽早在手势里唤醒。开局第一次射击往往就是第一次手势，单靠这一下仍来不及，
// 所以真正出声仍走上面的排队；这里只是让倒数、点按钮时先把上下文热起来。
if (typeof window !== 'undefined') {
  const warm = () => {
    const c = getCtx();
    if (c.state === 'suspended') c.resume().catch(() => {});
  };
  window.addEventListener('pointerdown', warm, { capture: true });
  window.addEventListener('keydown', warm, { capture: true });
}

function getPan(side) {
  return side === 'A' ? -0.9 : 0.9;
}

function getPitch(side) {
  return side === 'A' ? 1.15 : 0.85;
}

function playTone(c, freq, duration, type, volume, pan, startTime) {
  const t = Math.max(startTime, c.currentTime);
  const osc = c.createOscillator();
  const gain = c.createGain();
  const panner = c.createStereoPanner();

  osc.type = type;
  osc.frequency.value = freq;
  panner.pan.value = pan;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(gain);
  gain.connect(panner);
  panner.connect(c.destination);

  osc.start(t);
  osc.stop(t + duration);
}

export function playHit(side) {
  const pan = getPan(side);
  const pitch = getPitch(side);
  playWhenReady((c, when) => {
    playTone(c, 600 * pitch, 0.06, 'sine', 0.15, pan, when);
  });
}

export function playMiss(side) {
  const pan = getPan(side);
  const pitch = getPitch(side);
  playWhenReady((c, when) => {
    playTone(c, 150 * pitch, 0.15, 'square', 0.2, pan, when);
  });
}

export function playKill(side, isBoss = false) {
  const pan = getPan(side);
  const pitch = getPitch(side);
  playWhenReady((c, when) => {
    playTone(c, 500 * pitch, 0.05, 'sine', 0.25, pan, when);
    playTone(c, 750 * pitch, 0.05, 'sine', 0.25, pan, when + 0.08);
    if (isBoss) playTone(c, 1000 * pitch, 0.08, 'sine', 0.3, pan, when + 0.16);
  });
}

// 时间到、跳进结算页时先响这一声。胜利号角要等分数跳完、公布赢家才响。
export function playTimeUp() {
  playWhenReady((c, when) => {
    playTone(c, 880, 0.09, 'sine', 0.2, 0, when);
    playTone(c, 659, 0.09, 'sine', 0.18, 0, when + 0.11);
    playTone(c, 440, 0.28, 'triangle', 0.2, 0, when + 0.22);
  });
}

export function playVictory() {
  const notes = [523, 659, 784, 1047];
  playWhenReady((c, when) => {
    notes.forEach((freq, i) => {
      playTone(c, freq, 0.15, 'sine', 0.2, 0, when + i * 0.12);
    });
  });
}
