import React from 'react';
import { Link } from 'react-router-dom';
import { NavItem } from '../../../config/navigation';
import { Badge } from '../ui/Badge';

export const MegaMenu: React.FC<{ item: NavItem; onClose: () => void }> = ({ item, onClose }) => {
  if (!item.children || item.children.length === 0) return null;

  const colCount = item.children.length;

  return (
    <div className="absolute top-full left-0 mt-1 w-[540px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-50 animate-slide-up">
      <div className={`grid ${colCount === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-8`}>
        {item.children.map((column, i) => (
          <div key={i} className="flex flex-col gap-3">
            <h4 className="font-serif text-xs font-bold text-primary uppercase tracking-widest border-b border-slate-100 pb-2">
              {column.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {column.items.map((sub, j) => (
                <li key={j}>
                  <Link
                    to={sub.href}
                    onClick={onClose}
                    className="text-xs text-slate-600 hover:text-accent font-medium transition-colors flex items-center justify-between group py-1"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{sub.label}</span>
                    {sub.isNew && <Badge variant="new">New</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
