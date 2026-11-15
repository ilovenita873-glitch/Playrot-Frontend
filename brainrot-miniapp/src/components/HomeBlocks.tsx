import { useEffect, useState } from 'react';

/** Header: logo + balans + sozlamalar + avatar */
export function AppHeader({
  balance,
  letter,
  onTopUp,
  onSettings,
}: {
  balance: number;
  letter: string;
  onTopUp?: () => void;
  onSettings?: () => void;
}) {
  return (
    <header className="pr-header">
      <div className="pr-logo">
        PLAY<b>ROT</b>
      </div>
      <div className="pr-balance">
        <span className="coin">🪙 {balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
        <button className="pr-plus" onClick={onTopUp}>+</button>
      </div>
      <button className="pr-icon-btn" onClick={onSettings}>⚙</button>
      <div className="pr-avatar">{letter}</div>
    </header>
  );
}

export interface LiveDropItem {
  id: string;
  name: string;
  value: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  imageUrl?: string | null;
}

/** LIVE blok: kun top dropi + yutuqlar lentasi */
export function LiveBlock({ top, drops }: { top?: LiveDropItem; drops: LiveDropItem[] }) {
  return (
    <section className="pr-live">
      <span className="pr-live-badge">LIVE</span>

      {top && (
        <div className="pr-topdrop">
          {top.imageUrl && <img src={top.imageUrl} alt="" width={48} height={48} />}
          <div>
            <div className="label">🏆 KUN TOP DROPI</div>
            <div className="name">{top.name}</div>
          </div>
          <div className="price">🪙 {top.value.toLocaleString('ru-RU')}</div>
        </div>
      )}

      <div className="pr-strip">
        {drops.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 12, padding: 8 }}>Yutuqlar shu yerda ko'rinadi</div>
        )}
        {drops.map((d) => (
          <div key={d.id} className="pr-drop" data-rarity={d.rarity} title={d.name}>
            {d.imageUrl ? <img src={d.imageUrl} alt={d.name} /> : <span>❓</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Tugash vaqtigacha taymer (endsAt — ISO satr) */
export function CountdownCard({ endsAt, label = 'QOLGAN VAQT' }: { endsAt: string; label?: string }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(endsAt).getTime() - Date.now()));

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const s = Math.floor(left / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="pr-timer">
      <div>
        <div className="cap">{label}</div>
        <div className="time">
          {h > 0 ? `${h}:` : ''}
          {pad(m)}:{pad(sec)}
        </div>
      </div>
      <div style={{ fontSize: 44 }}>⏳</div>
    </div>
  );
}

/** Promokod + bonus */
export function PromoRow({ code, bonus }: { code: string; bonus: string }) {
  return (
    <div className="pr-promo">
      <div className="pr-promo-code">{code}</div>
      <div className="pr-promo-bonus">{bonus}</div>
    </div>
  );
}

/** Katta reklama banneri */
export function HeroBanner({ onOpen }: { onOpen?: () => void }) {
  return (
    <section className="pr-banner">
      <h2>
        <span>96%</span> RTP
        <br />
        ENG YAXSHI DROP
      </h2>
      <p>Keyslarni och va eng noyob buyumlarni yig'.</p>
      <button className="pr-btn" onClick={onOpen}>KEYSNI OCHISH</button>
    </section>
  );
}