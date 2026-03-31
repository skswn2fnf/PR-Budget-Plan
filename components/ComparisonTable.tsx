'use client';

import { MonthlyComparison } from '@/lib/types';

interface ComparisonTableProps {
  comparisons: MonthlyComparison[];
  prevLabel: string;
  currLabel: string;
  totalPrev: number;
  totalCurr: number;
}

export default function ComparisonTable({
  comparisons,
  prevLabel,
  currLabel,
  totalPrev,
  totalCurr,
}: ComparisonTableProps) {
  const formatNumber = (num: number) => {
    const rounded = Math.round(num * 10) / 10;
    return rounded % 1 === 0
      ? new Intl.NumberFormat('ko-KR').format(rounded)
      : rounded.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#2B2D42]">
              <th className="text-white font-semibold px-4 py-3 text-left border border-gray-300">
                구분
              </th>
              {comparisons.map((comp, idx) => (
                <th
                  key={idx}
                  className="text-white font-semibold px-4 py-3 text-center border border-gray-300"
                >
                  {comp.month}
                </th>
              ))}
              <th className="text-white font-semibold px-4 py-3 text-center border border-gray-300">
                합계
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Previous Label Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                {prevLabel}
              </td>
              {comparisons.map((comp, idx) => (
                <td
                  key={idx}
                  className="px-4 py-3 text-center border border-gray-300"
                >
                  {formatNumber(comp.prev)}
                </td>
              ))}
              <td className="px-4 py-3 text-center border border-gray-300 font-semibold">
                {formatNumber(totalPrev)}
              </td>
            </tr>

            {/* Current Label Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                {currLabel}
              </td>
              {comparisons.map((comp, idx) => (
                <td
                  key={idx}
                  className={`px-4 py-3 text-center border border-gray-300 ${
                    comp.diff > 0
                      ? 'bg-pink-50'
                      : comp.diff < 0
                        ? 'bg-blue-50'
                        : ''
                  }`}
                >
                  {formatNumber(comp.curr)}
                </td>
              ))}
              <td className="px-4 py-3 text-center border border-gray-300 font-semibold">
                {formatNumber(totalCurr)}
              </td>
            </tr>

            {/* Difference Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                증감
              </td>
              {comparisons.map((comp, idx) => (
                <td
                  key={idx}
                  className={`px-4 py-3 text-center border border-gray-300 font-semibold ${
                    comp.diff > 0
                      ? 'text-pink-600'
                      : comp.diff < 0
                        ? 'text-blue-600'
                        : ''
                  }`}
                >
                  {comp.diff > 0 ? '+' : ''}{formatNumber(comp.diff)}
                </td>
              ))}
              <td
                className={`px-4 py-3 text-center border border-gray-300 font-semibold ${
                  totalCurr - totalPrev > 0
                    ? 'text-pink-600'
                    : totalCurr - totalPrev < 0
                      ? 'text-blue-600'
                      : ''
                }`}
              >
                {totalCurr - totalPrev > 0 ? '+' : ''}{formatNumber(totalCurr - totalPrev)}
              </td>
            </tr>

            {/* Previous Percentage Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                기존 비중
              </td>
              {comparisons.map((comp, idx) => (
                <td key={idx} className="px-4 py-3 text-center border border-gray-300">
                  {formatPercent(comp.prevPct)}
                </td>
              ))}
              <td className="px-4 py-3 text-center border border-gray-300 font-semibold">
                100.0%
              </td>
            </tr>

            {/* Current Percentage Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                변경 비중
              </td>
              {comparisons.map((comp, idx) => (
                <td key={idx} className="px-4 py-3 text-center border border-gray-300">
                  {formatPercent(comp.currPct)}
                </td>
              ))}
              <td className="px-4 py-3 text-center border border-gray-300 font-semibold">
                100.0%
              </td>
            </tr>

            {/* Change Rate Row */}
            <tr className="hover:bg-gray-50">
              <td className="font-medium px-4 py-3 text-left border border-gray-300 bg-gray-50">
                증감률
              </td>
              {comparisons.map((comp, idx) => (
                <td
                  key={idx}
                  className={`px-4 py-3 text-center border border-gray-300 font-semibold ${
                    comp.changeRate > 0
                      ? 'text-pink-600'
                      : comp.changeRate < 0
                        ? 'text-blue-600'
                        : ''
                  }`}
                >
                  {comp.changeRate > 0 ? '+' : ''}{formatPercent(comp.changeRate)}
                </td>
              ))}
              <td className="px-4 py-3 text-center border border-gray-300 font-semibold">
                {totalPrev > 0 ? `${(((totalCurr - totalPrev) / totalPrev) * 100).toFixed(1)}%` : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
