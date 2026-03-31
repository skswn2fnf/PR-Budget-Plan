'use client';

import { useState, useEffect } from 'react';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import { getTTLTotal, calcPercentage } from '@/lib/calculations';
import type { BudgetData } from '@/lib/types';

const fallback = budgetData as unknown as BudgetData;

export default function Drilldown() {
  const [data, setData] = useState<BudgetData>(fallback);

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const [selectedVersionId, setSelectedVersionId] = useState(
    fallback.versions[fallback.versions.length - 1].id
  );
  const [selectedCategory, setSelectedCategory] = useState(fallback.categories[0].id);

  const selectedVersion = data.versions.find((v) => v.id === selectedVersionId)!;
  const firstVersion = data.versions[0];
  const months = data.metadata.months;
  const selectedCategoryName = data.categories.find((c) => c.id === selectedCategory)?.name ?? '';

  const selectedAlloc = selectedVersion.allocations[selectedCategory];
  const firstAlloc = firstVersion.allocations[selectedCategory];

  const selectedVersionTTL = getTTLTotal(selectedVersion);
  const categoryPercentage = selectedAlloc
    ? calcPercentage(selectedAlloc.total, selectedVersionTTL)
    : 0;

  const round1 = (v: number) => Math.round(v * 10) / 10;

  const chartData = months.map((month, i) => ({
    month,
    prev: firstAlloc?.monthly[i] ?? 0,
    curr: selectedAlloc?.monthly[i] ?? 0,
    diff: round1((selectedAlloc?.monthly[i] ?? 0) - (firstAlloc?.monthly[i] ?? 0)),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="카테고리 드릴다운"
        versions={data.versions.map((v) => ({ id: v.id, label: v.label }))}
        selectedVersionId={selectedVersionId}
        onVersionChange={setSelectedVersionId}
      />

      <div className="px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">카테고리 선택</label>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">
            월별 예산 비교 — {selectedCategoryName}
          </h3>
          <MonthlyBarChart data={chartData} height={300} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">카테고리 통계</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">카테고리</span>
                <span className="font-medium text-gray-900">{selectedCategoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">총액</span>
                <span className="font-medium text-gray-900">{selectedAlloc?.total ?? 0}백만</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TTL 대비 비율</span>
                <span className="font-medium text-gray-900">{categoryPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">월 평균</span>
                <span className="font-medium text-gray-900">
                  {((selectedAlloc?.total ?? 0) / months.length).toFixed(1)}백만
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">월별 상세</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">월</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">기존</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">변경</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">증감</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month, idx) => {
                  const prev = firstAlloc?.monthly[idx] ?? 0;
                  const curr = selectedAlloc?.monthly[idx] ?? 0;
                  const diff = round1(curr - prev);
                  return (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 px-2 text-gray-900">{month}</td>
                      <td className="text-right py-2 px-2 text-gray-500">{prev}</td>
                      <td className="text-right py-2 px-2 text-gray-900 font-medium">{curr}</td>
                      <td
                        className="text-right py-2 px-2 font-medium"
                        style={{ color: diff > 0 ? '#D63384' : diff < 0 ? '#1971C2' : '#868E96' }}
                      >
                        {diff === 0 ? '—' : (diff > 0 ? '+' : '') + diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
