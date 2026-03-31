'use client';

import type { DetailedGroup } from '@/lib/types';

interface DetailedBudgetTableProps {
  groups: DetailedGroup[];
  months: string[];
}

const GROUP_COLORS: Record<string, string> = {
  ambassador: '#FDF2F8',
  look_item: '#FFF8E1',
  sh_issue: '#FFF0F0',
  outdoor: '#F0FFF4',
  celeb: '#F3F0FF',
  kids_cat: '#EFF6FF',
  spot_cat: '#F0FDFA',
};

export default function DetailedBudgetTable({ groups, months }: DetailedBudgetTableProps) {
  const allItems = groups.flatMap((g) => g.items);
  const grandTotal = allItems.reduce((sum, item) => sum + item.total, 0);
  const grandMonthly = months.map((_, i) =>
    allItems.reduce((sum, item) => sum + item.monthly[i], 0)
  );

  const fmt = (v: number) =>
    v === 0
      ? '—'
      : v % 1 === 0
      ? v.toLocaleString()
      : v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const pct = (v: number, base: number) =>
    base === 0 ? '—' : `${((v / base) * 100).toFixed(0)}%`;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">세부 주제별 예산 배분</h3>
        <p className="text-xs text-gray-400 mt-1">월별 세부 주제별 예산 비중 배분 현황 · 단위: 백만원</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 900 }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 sticky left-0 bg-gray-50 z-10" style={{ width: 100, minWidth: 100 }}>구분</th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600 border-b border-gray-200" style={{ width: 130, minWidth: 130 }}>세부</th>
              {months.map((m) => (
                <th key={m} className="text-right px-2 py-3 font-semibold text-gray-600 border-b border-gray-200" style={{ width: 68, minWidth: 68 }}>{m}</th>
              ))}
              <th className="text-right px-3 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100" style={{ width: 80, minWidth: 80 }}>합계</th>
              <th className="text-right px-3 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100" style={{ width: 50, minWidth: 50 }}>비중</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const groupTotal = group.items.reduce((s, it) => s + it.total, 0);
              const groupMonthly = months.map((_, i) =>
                group.items.reduce((s, it) => s + it.monthly[i], 0)
              );
              const bgColor = GROUP_COLORS[group.id] ?? '#FFFFFF';

              return group.items.map((item, itemIdx) => {
                const isFirst = itemIdx === 0;
                const isLast = itemIdx === group.items.length - 1;
                const barWidth = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;

                return (
                  <tr key={item.id} style={{ backgroundColor: bgColor }}>
                    {/* Group name */}
                    {isFirst && (
                      <td
                        className="px-4 py-3 align-top sticky left-0 z-10"
                        rowSpan={group.items.length}
                        style={{
                          borderLeft: `3px solid ${item.color}`,
                          borderBottom: '2px solid #E5E7EB',
                          backgroundColor: bgColor,
                        }}
                      >
                        <div className="font-semibold text-gray-700 text-xs leading-tight break-keep whitespace-normal">
                          {group.name}
                        </div>
                      </td>
                    )}

                    {/* Item name */}
                    <td
                      className="px-3 py-3"
                      style={{ borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-gray-700 text-xs whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>

                    {/* Monthly values */}
                    {item.monthly.map((val, i) => {
                      const isHighInGroup =
                        group.items.length > 1 &&
                        groupMonthly[i] > 0 &&
                        val === Math.max(...group.items.map((it) => it.monthly[i])) &&
                        val > 0;
                      return (
                        <td
                          key={i}
                          className="text-right px-2 py-3 tabular-nums text-xs"
                          style={{
                            color: val === 0 ? '#DEE2E6' : isHighInGroup ? item.color : '#495057',
                            borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6',
                          }}
                        >
                          <span className={isHighInGroup ? 'font-bold' : ''}>{fmt(val)}</span>
                        </td>
                      );
                    })}

                    {/* Total + mini bar */}
                    <td
                      className="text-right px-3 py-3"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${bgColor} 50%, #F9FAFB)`,
                        borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6',
                      }}
                    >
                      <div className="font-bold text-xs" style={{ color: item.color }}>{fmt(item.total)}</div>
                      <div className="mt-1 h-1 rounded-full bg-gray-200/50 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: item.color, opacity: 0.5 }} />
                      </div>
                    </td>

                    {/* Percentage */}
                    <td
                      className="text-right px-3 py-3 text-xs font-medium text-gray-500"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${bgColor} 50%, #F9FAFB)`,
                        borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6',
                      }}
                    >
                      {pct(item.total, grandTotal)}
                    </td>
                  </tr>
                );
              });
            })}

            {/* Grand total */}
            <tr className="bg-gray-800 text-white">
              <td className="px-4 py-3 sticky left-0 bg-gray-800 z-10 font-bold text-xs" colSpan={2}>거래 TTL</td>
              {grandMonthly.map((val, i) => (
                <td key={i} className="text-right px-2 py-3 font-bold tabular-nums text-xs">{fmt(val)}</td>
              ))}
              <td className="text-right px-3 py-3 font-bold text-xs bg-gray-900">{fmt(grandTotal)}</td>
              <td className="text-right px-3 py-3 font-bold text-xs bg-gray-900">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
