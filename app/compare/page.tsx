'use client';

import { useState } from 'react';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import ComparisonTable from '@/components/ComparisonTable';
import { compareVersions, compareVersionsTTL } from '@/lib/calculations';
import type { BudgetData } from '@/lib/types';

const data = budgetData as unknown as BudgetData;

export default function Compare() {
  const [prevVersionId, setPrevVersionId] = useState(data.versions[0].id);
  const [currVersionId, setCurrVersionId] = useState(
    data.versions[data.versions.length - 1].id
  );
  const [tabMode, setTabMode] = useState<'adult_viral' | 'ttl'>('adult_viral');

  const prevVersion = data.versions.find((v) => v.id === prevVersionId)!;
  const currVersion = data.versions.find((v) => v.id === currVersionId)!;
  const months = data.metadata.months;

  const comparisons =
    tabMode === 'adult_viral'
      ? compareVersions(prevVersion, currVersion, 'adult_viral', months)
      : compareVersionsTTL(prevVersion, currVersion, months);

  const totalPrev =
    tabMode === 'adult_viral'
      ? prevVersion.allocations.adult_viral?.total ?? 0
      : Object.values(prevVersion.allocations).reduce((s, a) => s + a.total, 0);
  const totalCurr =
    tabMode === 'adult_viral'
      ? currVersion.allocations.adult_viral?.total ?? 0
      : Object.values(currVersion.allocations).reduce((s, a) => s + a.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="버전 비교" />

      <div className="px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기준 버전</label>
              <select
                value={prevVersionId}
                onChange={(e) => setPrevVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              >
                {data.versions.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비교 버전</label>
              <select
                value={currVersionId}
                onChange={(e) => setCurrVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              >
                {data.versions.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTabMode('adult_viral')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                tabMode === 'adult_viral'
                  ? 'bg-brand-pink text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              성인 바이럴 (키즈 제외)
            </button>
            <button
              onClick={() => setTabMode('ttl')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                tabMode === 'ttl'
                  ? 'bg-brand-pink text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              TTL (키즈 포함)
            </button>
          </div>
        </div>

        <ComparisonTable
          comparisons={comparisons}
          prevLabel={prevVersion.label}
          currLabel={currVersion.label}
          totalPrev={totalPrev}
          totalCurr={totalCurr}
        />
      </div>
    </div>
  );
}
