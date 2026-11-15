import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CaseItemInfo, DropResult } from '../services/api';

type ThumbItem = { imageUrl: string | null; type?: string; name: string };

export function ItemThumb({ item, size = 48 }: { item: ThumbItem; size?: number }) {
  return item.imageUrl ? (
    <img src={item.imageUrl} alt={item.name} draggable={false} style={{ width: size, height: size, objectFit: 'contain' }} />
  ) : (
    <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{item.type === 'ITEM' ? '🎁' : '🐾'}</span>
  );
}

const STRIP_LEN = 56; // ruletkadagi buyumlar soni
const WIN_INDEX = 46; // yutuq joylashadigan o'rin
const ITEM_W = 92;
const GAP = 8;
const STEP = ITEM_W + GAP;

/** Faqat ko'rinish uchun: ehtimollik bo'yicha tasodifiy buyum */
function pickByChance(pool: CaseItemInfo[]): CaseItemInfo {
  const total = pool.reduce((s, i) => s + i.chance, 0) || 1;
  let r = Math.random() * total;
  for (const it of pool) {
    r -= it.chance;
    if (r <= 0) return it;
  }
  return pool[pool.length - 1];
}

interface Props {
  pool: CaseItemInfo[];
  winner: DropResult; // serverda tanlangan haqiqiy yutuq
  running: boolean;
  durationMs: number;
  height?: number;
  onEnd?: () => void;
}

export default function CaseReel({ pool, winner, running, durationMs, height = 104, onEnd }: Props) {
  const strip = useMemo(() => {
    const list: (CaseItemInfo | DropResult)[] = Array.from({ length: STRIP_LEN }, () => pickByChance(pool));
    list[WIN_INDEX] = winner;
    return list;
  }, [pool, winner]);

  const jitter = useMemo(() => (Math.random() - 0.5) * ITEM_W * 0.6, [strip]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const [x, setX] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [ended, setEnded] = useState(false);

  useLayoutEffect(() => {
    if (!running) {
      setAnimate(false);
      setX(0);
      setEnded(false);
      return;
    }
    const w = wrapRef.current?.clientWidth ?? 300;
    const target = -(WIN_INDEX * STEP + ITEM_W / 2 - w / 2 + jitter);
    setAnimate(false);
    setX(0);
    setEnded(false);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setX(target);
      }),
    );
    return () => cancelAnimationFrame(raf);
  }, [running, strip, jitter]);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setEnded(true);
      onEndRef.current?.();
    }, durationMs + 120);
    return () => clearTimeout(timer);
  }, [running, strip, durationMs]);

  return (
    <div className="pr-reel" ref={wrapRef} style={{ height }}>
      <div className="pr-reel-marker" />
      <div
        className="pr-reel-track"
        style={{
          transform: `translateX(${x}px)`,
          transition: animate ? `transform ${durationMs}ms cubic-bezier(0.08, 0.6, 0.12, 1)` : 'none',
        }}
      >
        {strip.map((it, i) => (
          <div
            key={i}
            className={`pr-reel-item ${ended && i === WIN_INDEX ? 'pr-reel-win' : ''}`}
            data-rarity={it.rarity}
            style={{ width: ITEM_W }}
          >
            <ItemThumb item={it} size={Math.round(height * 0.5)} />
            <span className="pr-reel-name">{it.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}