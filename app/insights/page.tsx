'use client';

import { useEffect, useState } from 'react';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import InsightPanel from '@/components/InsightPanel';
import CategoryPieChart from '@/components/CategoryPieChart';
import type { BudgetData } from '@/lib/types';

const fallback = budgetData as unknown as BudgetData;

export default function Insights() {
  const [data, setData] = useState<BudgetData>(fallback);

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const latestVersion = data.versions[data.versions.length - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="SNS 트렌드 인사이트" />

      <div className="px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">개요</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            SNS 채널별 트렌드와 시즌 데이터를 기반으로 도출한 전략 인사이트입니다.
            각 이슈의 특성과 적정 예산 배분 시기를 분석하여, 바이럴 효율을 극대화할 수 있는
            권장사항을 제공합니다.
          </p>
        </div>

        <div className="mb-6">
          <InsightPanel
            insights={data.insights}
            monthLabels={data.metadata.months}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">이슈별 예산 비중 ({latestVersion.label})</h3>
          <CategoryPieChart issues={latestVersion.issues} />
        </div>
      </div>
    </div>
  );
}
