import { useEffect, type ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  locked?: boolean;
}

export default function Modal({ open, onClose, title, children, locked = false }: Props) {
  const { t } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, locked, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !locked && onClose()} />
      <div className="relative max-h-[92vh] w-full max-w-md animate-sheet overflow-y-auto rounded-t-3xl bg-bg p-4 pb-8 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h-display text-base">{title}</h2>
          <button className="chip" onClick={onClose} disabled={locked} aria-label={t('common.close')}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
