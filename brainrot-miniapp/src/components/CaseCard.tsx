import type { CaseBox } from '../services/api';
import { fmt } from '../utils/format';

export default function CaseCard({ box, onClick }: { box: CaseBox; onClick: () => void }) {
  return (
    <button className="pr-case" onClick={onClick}>
      <div className="pr-case-img">
        {box.imageUrl ? <img src={box.imageUrl} alt={box.name} /> : <span style={{ fontSize: 64 }}>📦</span>}
      </div>
      <div className="mt-2 text-sm font-extrabold">{box.name}</div>
      <span className="price">🪙 {fmt(box.price)}</span>
    </button>
  );
}