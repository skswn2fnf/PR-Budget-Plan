'use client';

import type { DetailedGroup } from '@/lib/types';

interface DetailedBudgetTableProps {
  groups: DetailedGroup[];
  months: string[];
}

export default function DetailedBudgetTable({ groups, months }: DetailedBudgetTableProps) {
  const allItems = groups.flatMap((g) => g.items);
  const grandTotal = allItems.reduce((sum, item) => sum + item.total, 0);
  const grandMonthly = months.map((_, i) => allItems.reduce((sum, item) => sum + item.monthly[i], 0));

  const fmt = (v: number) =>
    v === 0 ? '—' : v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (v: number, base: number) => (base === 0 ? '—' : `${((v / base) * 100).toFixed(0)}%`);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">세부 주제별 예산 배분</h3>
        <p className="text-xs text-gray-400 mt-1">월별 세부 주제별 예산 비중 배분 현황 · 단위: 백만원</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 w-28 sticky left-0 bg-gray-50 z-10">구분</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600 border-b border-gray-200 w-36">세부</th>
              {months.map((m) => (
                <th key={m} className="text-right px-3 py-3 font-semibold text-gray-600 border-b border-gray-200 min-w-[72px]">{m}</th>
              ))}
              <th className="text-right px-4 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100 min-w-[85px]">합계</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100 min-w-[55px]">비중</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const groupTotal = group.items.reduce((s, it) => s + it.total, 0);
              const groupMonthly = months.map((_, i) => group.items.reduce((s, it) => s + it.monthly[i], 0));

              return group.items.map((item, itemIdx) => {
                const isFirst = itemIdx === 0;
                const isLast = itemIdx === group.items.length - 1;
                const barWidth = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group/row">
                    {/* Group name - only first row */}
                    {isFirst && (
                      <td
                        className="px-4 py-2.5 border-b border-gray-100 align-top sticky left-0 bg-white z-10 font-semibold text-gray-700"
                        rowSpan={group.items.length}
                        style={{ borderLeft: `3px solid ${item.color}` }}
                      >
                        <div>{group.name}</div>
                        {group.items.length > 1 && (
                          <div className="text-[10px] text-gray-400 font-normal mt-1">소계 {fmt(groupTotal)}</div>
                        )}
                      </td>
                    )}

                    {/* Item name */}
                    <td className={`px-3 py-2.5 ${isLast ? 'border-b border-gray-200' : 'border-b border-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-gray-700 text-xs">{item.name}</span>
                      </div>
                      {item.note && (
                        <div className="text-[10px] text-gray-400 mt-0.5 ml-4 truncate max-w-[140px]" title={item.note}>{item.note}</div>
                      )}
                    </td>

                    {/* Monthly values */}
                    {item.monthly.map((val, i) => {
                      const monthGroupTotal = groupMonthly[i];
                      const isHighInGroup = group.items.length > 1 && monthGroupTotal > 0 && val === Math.max(...group.items.map(it => it.monthly[i])) && val > 0;
                      return (
                        <td
                          key={i}
                          className={`text-right px-3 py-2.5 tabular-nums ${isLast ? 'border-b border-gray-200' : 'border-b border-gray-50'}`}
                          style={{ color: val === 0 ? '#DEE2E6' : isHighInGroup ? item.color : '#495057' }}
                        >
                          <span className={isHighInGroup ? 'font-semibold' : ''}>{fmt(val)}</span>
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className={`text-right px-4 py-2.5 font-bold bg-gray-50 ${isLast ? 'border-b border-gray-200' : 'border-b border-gray-50'}`} style={{ color: item.color }}>
                      <div>{fmt(item.total)}</div>
                      {/* Mini bar */}
                      <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: item.color, opacity: 0.5 }} />
                      </div>
                    </td>

                    {/* Percentage */}
                    <td className={`text-right px-4 py-2.5 font-medium text-gray-500 bg-gray-50 ${isLast ? 'border-b border-gray-200' : 'border-b border-gray-50'}`}>
                      {pct(item.total, grandTotal)}
                    </td>
                  </tr>
                );
              });
            })}

            {/* Grand total */}
            <tr className="bg-gray-800 text-white">
              <td className="px-4 py-3 sticky left-0 bg-gray-800 z-10 font-bold" colSpan={2}>거래 TTL</td>
              {grandMonthly.map((val, i) => (
                <td key={i} className="text-right px-3 py-3 font-bold tabular-nums">{fmt(val)}</td>
              ))}
              <td className="text-right px-4 py-3 font-bold bg-gray-900">{fmt(grandTotal)}</td>
              <td className="text-right px-4 py-3 font-bold bg-gray-900">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
