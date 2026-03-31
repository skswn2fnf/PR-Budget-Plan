'use client';

import { useState, useMemo } from 'react';
import type { BudgetVersion } from '@/lib/types';
import { getTTLMonthly, getTTLTotal } from '@/lib/calculations';
import type { ComputedChangeHighlights } from '@/lib/calculations';

interface BudgetChangeCardsProps {
  highlights: ComputedChangeHighlights;
  prevVersion: BudgetVersion;
  currVersion: BudgetVersion;
  months: string[];
}

export default function BudgetChangeCards({
  highlights,
  prevVersion,
  currVersion,
  months,
}: BudgetChangeCardsProps) {
  const { increases, decreases, notes } = highlights;
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());

  const prevTTL = useMemo(() => getTTLMonthly(prevVersion), [prevVersion]);
  const currTTL = useMemo(() => getTTLMonthly(currVersion), [currVersion]);
  const prevTotal = useMemo(() => getTTLTotal(prevVersion), [prevVersion]);
  const currTotal = useMemo(() => getTTLTotal(currVersion), [currVersion]);

  const maxVal = Math.max(...prevTTL, ...currTTL, 1);

  const toggleMonth = (idx: number) => {
    setSelectedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const hasSelection = selectedMonths.size > 0;
  const selectedPrevSum = Array.from(selectedMonths).reduce((s, i) => s + prevTTL[i], 0);
  const selectedCurrSum = Array.from(selectedMonths).reduce((s, i) => s + currTTL[i], 0);
  const selectedPrevPct = prevTotal > 0 ? Math.round((selectedPrevSum / prevTotal) * 1000) / 10 : 0;
  const selectedCurrPct = currTotal > 0 ? Math.round((selectedCurrSum / currTotal) * 1000) / 10 : 0;
  const selectedChangePp = Math.round((selectedCurrPct - selectedPrevPct) * 10) / 10;
  const selectedMonthLabel = Array.from(selectedMonths)
    .sort((a, b) => a - b)
    .map((i) => months[i])
    .join(' · ');

  const round1 = (v: number) => Math.round(v * 10) / 10;

  const fmtWan = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 10000) return `${(abs / 10000).toFixed(1).replace(/\.0$/, '')}억`;
    return `${abs.toLocaleString()}만`;
  };

  return (
    <div className="space-y-5">
      {/* Monthly Weight Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-gray-900">월별 예산 비중 비교</h4>
          <p className="text-[11px] text-gray-400">
            월을 클릭하여 비중 변화를 확인하세요
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gray-300" />
            <span>기존</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#D63384' }} />
            <span>변경</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5" style={{ height: 140 }}>
          {months.map((month, i) => {
            const prevH = maxVal > 0 ? (prevTTL[i] / maxVal) * 100 : 0;
            const currH = maxVal > 0 ? (currTTL[i] / maxVal) * 100 : 0;
            const diff = round1(currTTL[i] - prevTTL[i]);
            const isSelected = selectedMonths.has(i);
            const prevPct = prevTotal > 0 ? round1((prevTTL[i] / prevTotal) * 100) : 0;
            const currPct = currTotal > 0 ? round1((currTTL[i] / currTotal) * 100) : 0;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center cursor-pointer group"
                onClick={() => toggleMonth(i)}
              >
                {/* Diff label on top */}
                <div
                  className="text-[10px] font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    color: diff > 0 ? '#D63384' : diff < 0 ? '#1971C2' : '#ADB5BD',
                    ...(isSelected ? { opacity: 1 } : {}),
                  }}
                >
                  {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff}`}
                </div>

                {/* Bars container */}
                <div className="w-full flex justify-center gap-0.5" style={{ height: 100 }}>
                  {/* Prev bar */}
                  <div className="flex-1 flex items-end max-w-[14px]">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${prevH}%`,
                        backgroundColor: isSelected ? '#9CA3AF' : '#D1D5DB',
                        minHeight: prevTTL[i] > 0 ? 3 : 0,
                      }}
                    />
                  </div>
                  {/* Curr bar */}
                  <div className="flex-1 flex items-end max-w-[14px]">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${currH}%`,
                        backgroundColor: isSelected ? '#D63384' : '#F0A0C0',
                        minHeight: currTTL[i] > 0 ? 3 : 0,
                      }}
                    />
                  </div>
                </div>

                {/* Month label */}
                <div
                  className="mt-1.5 text-[11px] font-medium transition-colors px-1.5 py-0.5 rounded"
                  style={{
                    color: isSelected ? '#D63384' : '#6B7280',
                    backgroundColor: isSelected ? '#FDF2F8' : 'transparent',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {month}
                </div>

                {/* Pct labels on hover/select */}
                <div
                  className="text-[9px] text-gray-400 transition-opacity"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  {prevPct}→{currPct}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected months summary */}
        {hasSelection && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-bold text-gray-700">
                {selectedMonthLabel} 비중 변화
              </h5>
              <button
                onClick={() => setSelectedMonths(new Set())}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                선택 해제
              </button>
            </div>

            {/* Comparison bars */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 text-[11px] font-semibold text-gray-500">기존</span>
                <div className="flex-1 flex h-7 rounded-md overflow-hidden">
                  <div
                    className="flex items-center justify-center text-[11px] font-semibold text-gray-500 transition-all"
                    style={{ width: `${100 - selectedPrevPct}%`, backgroundColor: '#E9ECEF' }}
                  >
                    {round1(100 - selectedPrevPct)}%
                  </div>
                  <div
                    className="flex items-center justify-center text-[11px] font-bold text-white transition-all"
                    style={{ width: `${selectedPrevPct}%`, backgroundColor: '#F0A0C0', minWidth: 40 }}
                  >
                    {selectedPrevPct}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 text-[11px] font-semibold text-gray-500">변경</span>
                <div className="flex-1 flex h-7 rounded-md overflow-hidden">
                  <div
                    className="flex items-center justify-center text-[11px] font-semibold text-gray-500 transition-all"
                    style={{ width: `${100 - selectedCurrPct}%`, backgroundColor: '#E9ECEF' }}
                  >
                    {round1(100 - selectedCurrPct)}%
                  </div>
                  <div
                    className="flex items-center justify-center text-[11px] font-bold text-white transition-all"
                    style={{ width: `${selectedCurrPct}%`, backgroundColor: '#D63384', minWidth: 40 }}
                  >
                    {selectedCurrPct}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  color: selectedChangePp >= 0 ? '#D63384' : '#1971C2',
                  backgroundColor: selectedChangePp >= 0 ? '#FDF2F8' : '#EFF6FF',
                }}
              >
                {selectedChangePp >= 0 ? '+' : ''}{selectedChangePp}%p
                {selectedChangePp >= 0 ? ' 확대' : ' 축소'}
              </span>
              <div className="text-xs font-bold text-gray-700">
                <span className="text-gray-400">{selectedPrevPct}%</span>
                <span className="mx-1 text-gray-300">→</span>
                <span style={{ color: selectedChangePp >= 0 ? '#D63384' : '#1971C2' }}>
                  {selectedCurrPct}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <div className={`${hasSelection ? 'mt-3' : 'mt-4'} pt-3 border-t border-gray-100 space-y-1`}>
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
