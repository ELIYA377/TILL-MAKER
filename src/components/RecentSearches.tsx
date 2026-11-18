import React from 'react';
import { SearchQueryHistory } from '../types';
import { History, Trash2, ArrowUpRight, CheckCircle2, Phone, CreditCard } from 'lucide-react';
import { isPhoneNumberQuery } from '../data/mockRecords';

interface RecentSearchesProps {
  history: SearchQueryHistory[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-2 text-neutral-400 font-mono">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>HISTORIA YA UTAFUTAJI / RECENT SEARCH QUERIES</span>
        </div>
        <button
          onClick={onClear}
          className="text-[11px] text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Futa historia</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => {
          const isPhone = isPhoneNumberQuery(item.query);
          return (
            <button
              key={idx}
              onClick={() => onSelect(item.query)}
              className="group px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-left transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              {isPhone ? (
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
                  {item.recordName}
                </span>
                <span className="font-mono text-[10px] text-neutral-400 flex items-center gap-1">
                  {isPhone ? (
                    <span className="text-emerald-400 font-bold">{item.query}</span>
                  ) : (
                    <span>{item.recordNin}</span>
                  )}
                </span>
              </div>
              <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-400 transition-colors ml-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
