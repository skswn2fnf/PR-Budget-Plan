'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import BudgetEditor from '@/components/BudgetEditor';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import type { BudgetData } from '@/lib/types';

const data = budgetData as unknown as BudgetData;

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function Editor() {
  const router = useRouter();
  const latestVersion = data.versions[data.versions.length - 1];
  const initialMonthly = latestVersion.allocations.adult_viral?.monthly ?? [];
  const months = data.metadata.months;

  const [editableMonthly, setEditableMonthly] = useState<number[]>([...initialMonthly]);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const editedTotal = Math.round(editableMonthly.reduce((sum, val) => sum + val, 0) * 10) / 10;
  const originalTotal = initialMonthly.reduce((sum, val) => sum + val, 0);
  const difference = Math.round((editedTotal - originalTotal) * 10) / 10;

  const chartData = months.map((month, i) => ({
    month,
    prev: initialMonthly[i] ?? 0,
    curr: editableMonthly[i] ?? 0,
    diff: (editableMonthly[i] ?? 0) - (initialMonthly[i] ?? 0),
  }));

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMsg('');

    const newVersionNumber = data.versions.length + 1;
    const today = new Date();
    const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const defaultLabel = `${newVersionNumber - 1}차 변경 (${mmdd})`;

    const body = {
      label: versionLabel.trim() || defaultLabel,
      note: versionNote.trim(),
      allocations: {
        ...latestVersion.allocations,
        adult_viral: {
          monthly: editableMonthly,
          total: editedTotal,
        },
      },
      issues: latestVersion.issues,
    };

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? '저장에 실패했습니다.');
      }

      setSaveStatus('success');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (e: unknown) {
      setSaveStatus('error');
      setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const valuesChanged = JSON.stringify(editableMonthly) !== JSON.stringify(initialMonthly);
  const hasLabelOrNote = versionLabel.trim() !== '' || versionNote.trim() !== '';
  const canSave = valuesChanged || hasLabelOrNote;
  const isSaving = saveStatus === 'saving';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="예산 편집" />

      <div className="px-6 py-8">
        {/* 안내 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">편집 방법</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            성인 바이럴 카테고리의 월별 예산을 직접 수정할 수 있습니다.
            금액을 변경하면 합계·비중이 실시간 재계산되며, 저장 시 새 버전으로 추가됩니다.
          </p>
        </div>

        {/* 편집 테이블 */}
        <BudgetEditor
          months={months}
          monthly={initialMonthly}
          categoryTotal={originalTotal}
          onUpdate={setEditableMonthly}
          label="성인 바이럴 예산"
        />

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-xs text-gray-400 mb-2">원본 합계</div>
            <div className="text-2xl font-bold text-gray-900">{originalTotal}</div>
            <div className="text-xs text-gray-400 mt-1">백만원</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-xs text-gray-400 mb-2">수정된 합계</div>
            <div className="text-2xl font-bold text-gray-900">{editedTotal}</div>
            <div className="text-xs text-gray-400 mt-1">백만원</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-xs text-gray-400 mb-2">변화액</div>
            <div
              className="text-2xl font-bold"
              style={{ color: difference > 0 ? '#D63384' : difference < 0 ? '#1971C2' : '#868E96' }}
            >
              {difference > 0 ? '+' : ''}{difference}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {originalTotal > 0
                ? `${difference >= 0 ? '+' : ''}${((difference / originalTotal) * 100).toFixed(1)}%`
                : '—'}
            </div>
          </div>
        </div>

        {/* 버전 정보 입력 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">새 버전 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                버전 레이블 <span className="text-gray-400 font-normal">(비우면 자동 생성)</span>
              </label>
              <input
                type="text"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder={`예: ${data.versions.length}차 변경 (03.26)`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">변경 사유 / 노트</label>
              <textarea
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                rows={2}
                placeholder="예: 5월 이벤트 집중을 위해 3월 예산 일부 이관"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-none"
              />
            </div>
          </div>
        </div>

        {/* 저장 상태 메시지 */}
        {saveStatus === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">
            ✅ 새 버전이 저장되었습니다. 대시보드로 이동합니다…
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            ❌ {errorMsg}
          </div>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving || saveStatus === 'success' || !canSave}
          className={`w-full font-semibold py-3 rounded-xl transition mb-6 ${
            isSaving || saveStatus === 'success'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : !canSave
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-brand-pink hover:bg-brand-pink/90 text-white'
          }`}
        >
          {isSaving ? '저장 중…' : saveStatus === 'success' ? '저장 완료!' : '새 버전으로 저장'}
        </button>

        {/* 미리보기 차트 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">편집 미리보기</h3>
          <MonthlyBarChart data={chartData} height={280} />
        </div>
      </div>
    </div>
  );
}
