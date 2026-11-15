import { useApp } from '../context/AppContext';

export function Spinner() {
  const { t } = useApp();
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {t('common.loading')}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useApp();
  return (
    <div className="card m-4 p-5 text-center">
      <div className="text-3xl">🛰️</div>
      <p className="mt-2 text-sm font-bold">{t('common.error')}</p>
      <p className="mt-1 text-xs text-muted">{message}</p>
      <button className="btn-brand mt-4" onClick={onRetry}>
        {t('common.retry')}
      </button>
    </div>
  );
}

export function Empty() {
  const { t } = useApp();
  return <p className="py-8 text-center text-sm text-muted">{t('common.empty')}</p>;
}
