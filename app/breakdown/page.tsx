'use client';

import { useState, useMemo, useEffect } from 'react';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import BudgetChangeCards from '@/components/BudgetChangeCards';
import BudgetSummaryTable from '@/components/BudgetSummaryTable';
import DetailedBudgetTable from '@/components/DetailedBudgetTable';
import { computeChangeHighlights } from '@/lib/calculations';
import type { BudgetData } from '@/lib/types';

const fallback = budgetData as unknown as BudgetData;

export default function Breakdown() {
  const [data, setData] = useState<BudgetData>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [selectedVersionId, setSelectedVersionId] = useState(
    fallback.versions[fallback.versions.length - 1].id
  );

  const breakdown = data.breakdowns[selectedVersionId];
  const months = data.metadata.months;
  const selectedIdx = data.versions.findIndex((v) => v.id === selectedVersionId);
  const selectedVersion = data.versions[selectedIdx];
  const prevVersion = selectedIdx > 0 ? data.versions[selectedIdx - 1] : selectedVersion;

  const changeHighlights = useMemo(
    () =>
      computeChangeHighlights(
        prevVersion,
        selectedVersion,
        months,
        prevVersion.label,
        selectedVersion.label
      ),
    [prevVersion, selectedVersion, months]
  );

  const computeTTLFromBreakdown = (versionId: string): number[] | undefined => {
    const bd = data.breakdowns[versionId];
    if (!bd?.detailed?.length) return undefined;
    const allItems = bd.detailed.flatMap((g) => g.items);
    return months.map((_, i) =>
      Math.round(allItems.reduce((sum, it) => sum + (it.monthly[i] ?? 0), 0) * 100) / 100
    );
  };

  const currMonthlyFromBreakdown = useMemo(
    () => computeTTLFromBreakdown(selectedVersionId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedVersionId]
  );
  const prevMonthlyFromBreakdown = useMemo(
    () => selectedIdx > 0 ? computeTTLFromBreakdown(data.versions[selectedIdx - 1].id) : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedIdx]
  );

  if (!breakdown) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="예산 변동 상세"
          versions={data.versions.map((v) => ({ id: v.id, label: v.label }))}
          selectedVersionId={selectedVersionId}
          onVersionChange={setSelectedVersionId}
        />
        <div className="px-6 py-16 text-center">
          <div className="bg-white rounded-xl shadow-sm p-10 max-w-md mx-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">데이터를 불러오는 중...</p>
            ) : (
              <>
                <p className="text-gray-400 text-sm">선택한 버전의 세부 예산 데이터가 없습니다.</p>
                <p className="text-gray-300 text-xs mt-2">세부 예산 편집에서 데이터를 추가해주세요.</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="예산 변동 상세"
        versions={data.versions.map((v) => ({ id: v.id, label: v.label }))}
        selectedVersionId={selectedVersionId}
        onVersionChange={setSelectedVersionId}
      />

      <div className="px-6 py-8 space-y-8">
        {/* Version info banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{selectedVersion.label}</h2>
              <p className="text-gray-300 text-sm mt-1">{selectedVersion.note}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{data.metadata.totalBudget / 100}억</div>
              <div className="text-gray-400 text-xs mt-1">
                {data.metadata.totalBudget}백만 · {data.metadata.year}년
              </div>
            </div>
          </div>
        </div>

        {/* 주요 변동 요약 카드 — 동적 계산 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#D63384] rounded-full" />
            <h2 className="text-sm font-bold text-gray-700 tracking-wide">주요 변동 요약</h2>
            <span className="text-xs text-gray-400 ml-2">
              {prevVersion.label} 대비 자동 계산
            </span>
          </div>
          <BudgetChangeCards
            highlights={changeHighlights}
            prevVersion={prevVersion}
            currVersion={selectedVersion}
            months={months}
            prevMonthlyOverride={prevMonthlyFromBreakdown}
            currMonthlyOverride={currMonthlyFromBreakdown}
          />
        </section>

        {/* Section 1: 총예산 월별 개요 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gray-800 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700 tracking-wide">SECTION 1 — 총예산</h2>
            <span className="text-xs text-gray-400 ml-2">월별 주요 이슈 비중 배분 확인</span>
          </div>
          <BudgetSummaryTable
            rows={breakdown.summary}
            months={months}
            totalBudget={data.metadata.totalBudget}
          />
        </section>

        {/* Section 2: 세부 주제별 예산 배분 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#D63384] rounded-full" />
            <h2 className="text-sm font-bold text-gray-700 tracking-wide">SECTION 2 — 세부 주제별 예산</h2>
            <span className="text-xs text-gray-400 ml-2">주제별 월간 예산 비중 배분 확인</span>
          </div>
          <DetailedBudgetTable groups={breakdown.detailed} months={months} />
        </section>
      </div>
    </div>
  );
}
