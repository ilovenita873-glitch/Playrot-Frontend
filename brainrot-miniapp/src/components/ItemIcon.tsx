import type { Item } from '../types';

export default function ItemIcon({ item, size = 'text-4xl' }: { item: Pick<Item, 'emoji' | 'image' | 'name'>; size?: string }) {
  if (item.image) return <img src={item.image} alt={item.name} className="h-12 w-12 object-contain" draggable={false} />;
  return <span className={size}>{item.emoji}</span>;
}
