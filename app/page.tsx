'use client';

import { useState, useEffect } from 'react';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import VersionTimeline from '@/components/VersionTimeline';
import {
  compareVersions,
  getTTLTotal,
  totalIncrease,
  totalDecrease,
  findPeakMonth,
} from '@/lib/calculations';
import type { BudgetData } from '@/lib/types';

const fallback = budgetData as unknown as BudgetData;

export default function Dashboard() {
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

  const selectedVersion = data.versions.find((v) => v.id === selectedVersionId)!;
  const firstVersion = data.versions[0];
  const months = data.metadata.months;

  const comparisons = compareVersions(firstVersion, selectedVersion, 'adult_viral', months);

  const ttlTotal = getTTLTotal(selectedVersion);
  const adultTotal = selectedVersion.allocations.adult_viral?.total ?? 0;
  const adultMonthly = selectedVersion.allocations.adult_viral?.monthly ?? [];
  const peak = findPeakMonth(adultMonthly, months);
  const incr = totalIncrease(comparisons);
  const decr = totalDecrease(comparisons);

  const round1 = (v: number) => Math.round(v * 10) / 10;

  const prevMonthly = firstVersion.allocations.adult_viral?.monthly ?? [];
  const chartData = months.map((month, i) => ({
    month,
    prev: prevMonthly[i] ?? 0,
    curr: adultMonthly[i] ?? 0,
    diff: round1((adultMonthly[i] ?? 0) - (prevMonthly[i] ?? 0)),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Overview"
        versions={data.versions.map((v) => ({ id: v.id, label: v.label }))}
        selectedVersionId={selectedVersionId}
        onVersionChange={setSelectedVersionId}
      />

      <div className="px-6 py-8">
        <KPICards
          totalBudget={ttlTotal}
          adultTotal={adultTotal}
          peakMonth={peak.month}
          peakValue={peak.value}
          totalIncrease={incr}
          totalDecrease={decr}
        />

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">월별 예산 (성인 바이럴)</h3>
            <MonthlyBarChart data={chartData} height={340} />
          </div>
          <div>
            <CategoryPieChart issues={selectedVersion.issues} />
          </div>
        </div>

        <div className="mt-8">
          <VersionTimeline
            versions={data.versions}
            selectedId={selectedVersionId}
            onSelect={setSelectedVersionId}
            months={months}
          />
        </div>
      </div>
    </div>
  );
}
