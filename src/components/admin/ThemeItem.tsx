import React from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function ThemeItem({
  theme,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  theme: any,
  isSelected: boolean,
  onClick: () => void,
  onEdit: (e: any) => void,
  onDelete: (e: any) => void,
  onMoveUp?: (e: any) => void,
  onMoveDown?: (e: any) => void,
  isFirst?: boolean,
  isLast?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all cursor-pointer group flex justify-between items-center ${
        isSelected
          ? 'bg-blue-50/70 border-blue-200/80 dark:bg-blue-950/20 dark:border-blue-900/50'
          : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-1 h-8 rounded-full shrink-0 ${isSelected ? 'bg-[#0046ab]' : 'bg-neutral-200 dark:bg-zinc-700'}`} />
        <span className={`font-semibold text-sm truncate ${isSelected ? 'text-[#0046ab] dark:text-blue-400' : 'text-neutral-700 dark:text-zinc-300'}`}>
          {theme.name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveUp && !isFirst && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(e); }}
            className="p-1 text-neutral-450 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-zinc-800 cursor-pointer"
            title="Mover arriba"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}
        {onMoveDown && !isLast && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(e); }}
            className="p-1 text-neutral-450 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-zinc-800 cursor-pointer"
            title="Mover abajo"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(e); }}
          className="p-1.5 text-neutral-450 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-zinc-800 cursor-pointer"
          title="Editar tema"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e); }}
          className="p-1.5 text-neutral-450 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
          title="Eliminar tema"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
