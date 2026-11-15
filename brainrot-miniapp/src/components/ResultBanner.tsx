import { useApp } from '../context/AppContext';
import { fmt } from '../utils/format';

export default function ResultBanner({ win, payout }: { win: boolean; payout: number }) {
  const { t } = useApp();
  return (
    <div className={`animate-pop rounded-2xl p-3 text-center font-extrabold text-white ${win ? 'bg-good' : 'bg-bad'}`}>
      {win ? `🎉 ${t('common.win')}: +${fmt(payout)} 🪙` : `💥 ${t('common.lose')}`}
    </div>
  );
}
