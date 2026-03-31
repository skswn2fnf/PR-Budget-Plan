'use client';

import type { ComputedChangeHighlights } from '@/lib/calculations';

interface BudgetChangeCardsProps {
  highlights: ComputedChangeHighlights;
}

export default function BudgetChangeCards({ highlights }: BudgetChangeCardsProps) {
  const { focusPeriod, increases, decreases, notes } = highlights;

  const fmtWan = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 10000) return `${(abs / 10000).toFixed(1).replace(/\.0$/, '')}억`;
    return `${abs.toLocaleString()}만`;
  };

  return (
    <div className="space-y-5">
      {/* Focus Period Bar Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-5">{focusPeriod.label}</h4>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-10 text-xs font-semibold text-gray-500 flex-shrink-0">{focusPeriod.prevLabel}</span>
            <div className="flex-1 flex h-9 rounded-md overflow-hidden">
              <div
                className="flex items-center justify-center text-xs font-semibold text-gray-600 transition-all"
                style={{ width: `${focusPeriod.prevOtherPct}%`, backgroundColor: '#E9ECEF' }}
              >
                {focusPeriod.prevOtherPct}%
              </div>
              <div
                className="flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{ width: `${focusPeriod.prevFocusPct}%`, backgroundColor: '#F0A0C0' }}
              >
                {focusPeriod.prevFocusPct}% ({focusPeriod.monthRange})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 text-xs font-semibold text-gray-500 flex-shrink-0">{focusPeriod.currLabel}</span>
            <div className="flex-1 flex h-9 rounded-md overflow-hidden">
              <div
                className="flex items-center justify-center text-xs font-semibold text-gray-600 transition-all"
                style={{ width: `${focusPeriod.currOtherPct}%`, backgroundColor: '#E9ECEF' }}
              >
                {focusPeriod.currOtherPct}%
              </div>
              <div
                className="flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{ width: `${focusPeriod.currFocusPct}%`, backgroundColor: '#D63384' }}
              >
                {focusPeriod.currFocusPct}% ({focusPeriod.monthRange})
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold"
            style={{
              color: focusPeriod.changePp >= 0 ? '#D63384' : '#1971C2',
              backgroundColor: focusPeriod.changePp >= 0 ? '#FDF2F8' : '#EFF6FF',
            }}
          >
            {focusPeriod.changePp >= 0 ? '+' : ''}{focusPeriod.changePp}%p {focusPeriod.changePp >= 0 ? '확대' : '축소'}
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-400">{focusPeriod.monthRange} 비중</span>
            <div className="text-sm font-bold text-gray-800">
              <span className="text-gray-400">{focusPeriod.prevFocusPct}%</span>
              <span className="mx-1.5 text-gray-300">→</span>
              <span style={{ color: focusPeriod.changePp >= 0 ? '#D63384' : '#1971C2' }}>{focusPeriod.currFocusPct}%</span>
            </div>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
            {notes.map((note, i) => (
              <p key={i} className="text-[11px] text-gray-400 leading-relaxed">* {note}</p>
            ))}
          </div>
        )}
      </div>

      {/* Increase / Decrease Cards */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border-t-[3px]" style={{ borderTopColor: increases.color }}>
          <p className="text-xs text-gray-500 font-medium mb-1">{increases.label}</p>
          <p className="text-3xl font-bold mb-4" style={{ color: increases.color }}>
            +{fmtWan(increases.totalChange)}
          </p>
          <ul className="space-y-2">
            {increases.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: increases.color }} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-t-[3px]" style={{ borderTopColor: decreases.color }}>
          <p className="text-xs text-gray-500 font-medium mb-1">{decreases.label}</p>
          <p className="text-3xl font-bold mb-4" style={{ color: decreases.color }}>
            −{fmtWan(Math.abs(decreases.totalChange))}
          </p>
          <ul className="space-y-2">
            {decreases.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: decreases.color }} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
