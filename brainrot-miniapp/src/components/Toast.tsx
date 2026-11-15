import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((m) => (
        <div
          key={m.id}
          className={`animate-pop rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg ${m.type === 'ok' ? 'bg-good' : 'bg-bad'}`}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
