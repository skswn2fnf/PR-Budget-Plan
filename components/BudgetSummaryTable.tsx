'use client';

import type { BudgetSummaryRow } from '@/lib/types';

interface BudgetSummaryTableProps {
  rows: BudgetSummaryRow[];
  months: string[];
  totalBudget: number;
}

export default function BudgetSummaryTable({ rows, months, totalBudget }: BudgetSummaryTableProps) {
  const ttlMonthly = months.map((_, i) => rows.reduce((sum, r) => sum + r.monthly[i], 0));
  const ttlTotal = rows.reduce((sum, r) => sum + r.total, 0);

  const fmt = (v: number) => v === 0 ? '—' : v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (v: number, base: number) => base === 0 ? '—' : `${((v / base) * 100).toFixed(0)}%`;

  const maxMonthlyTTL = Math.max(...ttlMonthly);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">총예산 월별 개요</h3>
        <p className="text-xs text-gray-400 mt-1">월별 주요 이슈 비중 배분 현황 · 단위: 백만원</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 w-36 sticky left-0 bg-gray-50 z-10">구분</th>
              {months.map((m) => (
                <th key={m} className="text-right px-3 py-3 font-semibold text-gray-600 border-b border-gray-200 min-w-[80px]">{m}</th>
              ))}
              <th className="text-right px-4 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100 min-w-[90px]">합계</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100 min-w-[60px]">비중</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-gray-800">{row.name}</span>
                  </div>
                </td>
                {row.monthly.map((val, i) => (
                  <td key={i} className="text-right px-3 py-3 border-b border-gray-100 tabular-nums" style={{ color: val === 0 ? '#CED4DA' : '#495057' }}>
                    {fmt(val)}
                  </td>
                ))}
                <td className="text-right px-4 py-3 font-bold border-b border-gray-100 bg-gray-50" style={{ color: row.color }}>
                  {fmt(row.total)}
                </td>
                <td className="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
                  {pct(row.total, ttlTotal)}
                </td>
              </tr>
            ))}

            {/* TTL Row */}
            <tr className="bg-gray-800 text-white">
              <td className="px-4 py-3 sticky left-0 bg-gray-800 z-10 font-bold">TTL</td>
              {ttlMonthly.map((val, i) => (
                <td key={i} className="text-right px-3 py-3 font-bold tabular-nums">{fmt(val)}</td>
              ))}
              <td className="text-right px-4 py-3 font-bold bg-gray-900">{fmt(ttlTotal)}</td>
              <td className="text-right px-4 py-3 font-bold bg-gray-900">100%</td>
            </tr>

            {/* 비중 Row */}
            <tr className="bg-gray-50">
              <td className="px-4 py-2.5 sticky left-0 bg-gray-50 z-10 text-xs font-semibold text-gray-500">비중</td>
              {ttlMonthly.map((val, i) => (
                <td key={i} className="text-right px-3 py-2.5 text-xs font-semibold" style={{ color: val === maxMonthlyTTL ? '#D63384' : '#868E96' }}>
                  {pct(val, ttlTotal)}
                </td>
              ))}
              <td className="text-right px-4 py-2.5 bg-gray-100" />
              <td className="text-right px-4 py-2.5 bg-gray-100" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly weight bar visualization */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-end gap-1" style={{ height: 48 }}>
          <div className="w-36 flex-shrink-0" />
          {ttlMonthly.map((val, i) => {
            const heightPct = maxMonthlyTTL > 0 ? (val / maxMonthlyTTL) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: val === maxMonthlyTTL ? '#D63384' : '#E9ECEF',
                    minHeight: val > 0 ? 4 : 0,
                  }}
                />
              </div>
            );
          })}
          <div className="min-w-[90px]" />
          <div className="min-w-[60px]" />
        </div>
      </div>
    </div>
  );
}
