let ctx: AudioContext | null = null;

export function beep(kind: 'click' | 'win' | 'lose' | 'tick', enabled: boolean): void {
  if (!enabled) return;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new Ctor();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const map = { click: [520, 0.06], tick: [800, 0.03], win: [880, 0.28], lose: [160, 0.3] } as const;
    const [freq, dur] = map[kind];
    o.type = kind === 'lose' ? 'sawtooth' : 'triangle';
    o.frequency.value = freq;
    if (kind === 'win') o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + dur);
    g.gain.value = 0.05;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* audio mavjud emas */
  }
}
