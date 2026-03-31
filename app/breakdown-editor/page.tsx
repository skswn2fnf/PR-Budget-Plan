'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import budgetData from '@/data/budget.json';
import Header from '@/components/Header';
import type { BudgetData, DetailedGroup, DetailedItem, BudgetSummaryRow } from '@/lib/types';
import { Plus, Trash2, GripVertical, Save, RotateCcw } from 'lucide-react';

const fallback = budgetData as unknown as BudgetData;

const GROUP_COLORS: Record<string, string> = {
  ambassador: '#FDF2F8',
  look_item: '#FFF8E1',
  sh_issue: '#FFF0F0',
  kids_cat: '#EFF6FF',
  spot_cat: '#F0FDFA',
};

const GROUP_BORDER_COLORS: Record<string, string> = {
  ambassador: '#D63384',
  look_item: '#E67700',
  sh_issue: '#FF6B6B',
  kids_cat: '#1971C2',
  spot_cat: '#0CA678',
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function getBreakdownForVersion(
  bData: BudgetData,
  versionId: string
): { groups: DetailedGroup[]; source: 'own' | 'template'; templateFrom?: string } {
  const own = bData.breakdowns[versionId];
  if (own?.detailed?.length) {
    return { groups: own.detailed, source: 'own' };
  }
  const allVersionIds = Object.keys(bData.breakdowns);
  if (allVersionIds.length > 0) {
    const templateId = allVersionIds[allVersionIds.length - 1];
    const template = bData.breakdowns[templateId];
    if (template?.detailed?.length) {
      const templateLabel = bData.versions.find((v) => v.id === templateId)?.label ?? templateId;
      return { groups: template.detailed, source: 'template', templateFrom: templateLabel };
    }
  }
  return { groups: [], source: 'own' };
}

export default function BreakdownEditor() {
  const router = useRouter();
  const [data, setData] = useState<BudgetData>(fallback);
  const months = data.metadata.months;

  const [selectedVersionId, setSelectedVersionId] = useState(
    fallback.versions[fallback.versions.length - 1].id
  );

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((d: BudgetData) => {
        setData(d);
        const result = getBreakdownForVersion(d, selectedVersionId);
        setGroups(JSON.parse(JSON.stringify(result.groups)));
        setTemplateSource(result.templateFrom);
        setInitialSnapshot(JSON.stringify(result.groups));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = getBreakdownForVersion(data, selectedVersionId);
  const [groups, setGroups] = useState<DetailedGroup[]>(
    JSON.parse(JSON.stringify(initial.groups))
  );
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initial.groups));
  const [templateSource, setTemplateSource] = useState<string | undefined>(initial.templateFrom);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isNewBreakdown = !data.breakdowns[selectedVersionId]?.detailed?.length;
  const hasChanges = useMemo(
    () => JSON.stringify(groups) !== initialSnapshot,
    [groups, initialSnapshot]
  );
  const canSave = hasChanges || isNewBreakdown;

  const grandTotal = useMemo(
    () => groups.flatMap((g) => g.items).reduce((sum, it) => sum + it.monthly.reduce((s, v) => s + v, 0), 0),
    [groups]
  );

  const grandMonthly = useMemo(
    () => months.map((_, i) => groups.flatMap((g) => g.items).reduce((sum, it) => sum + it.monthly[i], 0)),
    [groups, months]
  );

  const fmt = (v: number) =>
    v === 0 ? '—' : v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const updateItemMonthly = useCallback((groupIdx: number, itemIdx: number, monthIdx: number, value: string) => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      const num = value === '' ? 0 : parseFloat(value);
      next[groupIdx].items[itemIdx].monthly[monthIdx] = isNaN(num) ? 0 : num;
      next[groupIdx].items[itemIdx].total = next[groupIdx].items[itemIdx].monthly.reduce((s: number, v: number) => s + v, 0);
      return next;
    });
  }, []);

  const updateItemName = useCallback((groupIdx: number, itemIdx: number, name: string) => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      next[groupIdx].items[itemIdx].name = name;
      return next;
    });
  }, []);

  const updateGroupName = useCallback((groupIdx: number, name: string) => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      next[groupIdx].name = name;
      return next;
    });
  }, []);

  const addItem = useCallback((groupIdx: number) => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      const group = next[groupIdx];
      const newItem: DetailedItem = {
        id: `new_${Date.now()}`,
        name: '새 항목',
        monthly: months.map(() => 0),
        total: 0,
        color: GROUP_BORDER_COLORS[group.id] ?? '#868E96',
      };
      group.items.push(newItem);
      return next;
    });
  }, [months]);

  const removeItem = useCallback((groupIdx: number, itemIdx: number) => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      if (next[groupIdx].items.length <= 1) return prev;
      next[groupIdx].items.splice(itemIdx, 1);
      return next;
    });
  }, []);

  const addGroup = useCallback(() => {
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      const newGroup: DetailedGroup = {
        id: `group_${Date.now()}`,
        name: '새 그룹',
        items: [{
          id: `item_${Date.now()}`,
          name: '새 항목',
          monthly: months.map(() => 0),
          total: 0,
          color: '#868E96',
        }],
      };
      next.push(newGroup);
      return next;
    });
  }, [months]);

  const removeGroup = useCallback((groupIdx: number) => {
    setGroups((prev) => {
      if (prev.length <= 1) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as DetailedGroup[];
      next.splice(groupIdx, 1);
      return next;
    });
  }, []);

  const resetChanges = useCallback(() => {
    const result = getBreakdownForVersion(data, selectedVersionId);
    setGroups(JSON.parse(JSON.stringify(result.groups)));
    setInitialSnapshot(JSON.stringify(result.groups));
    setSaveStatus('idle');
  }, [data, selectedVersionId]);

  const computeSummaryFromDetailed = (detailed: DetailedGroup[]): BudgetSummaryRow[] => {
    const templateSummary = (() => {
      const own = data.breakdowns[selectedVersionId]?.summary;
      if (own) return own;
      const allKeys = Object.keys(data.breakdowns);
      for (const key of allKeys) {
        if (data.breakdowns[key]?.summary?.length) return data.breakdowns[key].summary;
      }
      return null;
    })();

    if (templateSummary) {
      return templateSummary.map((row) => {
        const relatedItems = detailed.flatMap((g) => g.items).filter((it) => {
          if (row.id === 'spot') return it.id === 'spot';
          if (row.id === 'kids') return it.id === 'kids';
          return !['spot', 'kids'].includes(it.id);
        });
        const monthly = months.map((_, i) =>
          Math.round(relatedItems.reduce((s, it) => s + it.monthly[i], 0) * 10) / 10
        );
        const total = Math.round(monthly.reduce((s, v) => s + v, 0) * 10) / 10;
        return { ...row, monthly, total };
      });
    }
    const allItems = detailed.flatMap((g) => g.items);
    const monthly = months.map((_, i) =>
      Math.round(allItems.reduce((s, it) => s + it.monthly[i], 0) * 10) / 10
    );
    const total = Math.round(monthly.reduce((s, v) => s + v, 0) * 10) / 10;
    return [{ id: 'all', name: '전체', monthly, total, color: '#D63384' }];
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMsg('');

    const normalizedGroups = groups.map((g) => ({
      ...g,
      items: g.items.map((it) => ({
        ...it,
        total: Math.round(it.monthly.reduce((s, v) => s + v, 0) * 10) / 10,
      })),
    }));

    const breakdown = {
      summary: computeSummaryFromDetailed(normalizedGroups),
      detailed: normalizedGroups,
    };

    try {
      const res = await fetch('/api/budget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: selectedVersionId, breakdown }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? '저장에 실패했습니다.');
      }

      const freshData: BudgetData = await fetch('/api/budget').then((r) => r.json());
      setData(freshData);
      setInitialSnapshot(JSON.stringify(normalizedGroups));

      setSaveStatus('success');
      setTimeout(() => {
        router.push('/breakdown');
        router.refresh();
      }, 1200);
    } catch (e: unknown) {
      setSaveStatus('error');
      setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  };

  const handleVersionChange = (id: string) => {
    setSelectedVersionId(id);
    const result = getBreakdownForVersion(data, id);
    setGroups(JSON.parse(JSON.stringify(result.groups)));
    setInitialSnapshot(JSON.stringify(result.groups));
    setTemplateSource(result.templateFrom);
    setSaveStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="세부 예산 편집"
        versions={data.versions.map((v) => ({ id: v.id, label: v.label }))}
        selectedVersionId={selectedVersionId}
        onVersionChange={handleVersionChange}
      />

      <div className="px-6 py-8 space-y-6">
        {/* 안내 */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">편집 방법</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            각 셀을 클릭하여 월별 예산을 직접 수정할 수 있습니다.
            그룹/항목 추가·삭제 후 저장하면 해당 버전의 세부 예산이 업데이트됩니다.
          </p>
        </div>

        {/* 템플릿 복사 안내 */}
        {isNewBreakdown && templateSource && groups.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <span className="text-amber-500 text-lg leading-none mt-0.5">*</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                이 버전에는 세부 예산 데이터가 아직 없습니다
              </p>
              <p className="text-xs text-amber-600 mt-1">
                <span className="font-medium">{templateSource}</span> 버전의 데이터를 템플릿으로 불러왔습니다.
                금액을 수정한 후 저장하면 이 버전의 세부 예산으로 저장됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 통계 바 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-400 mb-1">총 그룹</div>
            <div className="text-xl font-bold text-gray-900">{groups.length}개</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-400 mb-1">총 항목</div>
            <div className="text-xl font-bold text-gray-900">
              {groups.reduce((s, g) => s + g.items.length, 0)}개
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-400 mb-1">예산 합계</div>
            <div className="text-xl font-bold text-gray-900">
              {fmt(Math.round(grandTotal * 10) / 10)}
              <span className="text-xs font-normal text-gray-400 ml-1">백만</span>
            </div>
          </div>
        </div>

        {/* 편집 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">세부 주제별 예산 편집</h3>
              <p className="text-xs text-gray-400 mt-0.5">셀 클릭으로 금액 수정 · 단위: 백만원</p>
            </div>
            <button
              onClick={addGroup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition"
            >
              <Plus size={14} /> 그룹 추가
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: 960 }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-3 font-semibold text-gray-600 border-b border-gray-200 sticky left-0 bg-gray-50 z-10" style={{ width: 110 }}>구분</th>
                  <th className="text-left px-2 py-3 font-semibold text-gray-600 border-b border-gray-200" style={{ width: 140 }}>세부</th>
                  {months.map((m) => (
                    <th key={m} className="text-center px-1 py-3 font-semibold text-gray-600 border-b border-gray-200" style={{ width: 78 }}>{m}</th>
                  ))}
                  <th className="text-right px-3 py-3 font-bold text-gray-700 border-b border-gray-200 bg-gray-100" style={{ width: 70 }}>합계</th>
                  <th className="text-center px-2 py-3 font-semibold text-gray-600 border-b border-gray-200" style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, gIdx) => {
                  const bgColor = GROUP_COLORS[group.id] ?? '#FFFFFF';
                  const borderColor = GROUP_BORDER_COLORS[group.id] ?? '#868E96';
                  const groupTotal = group.items.reduce((s, it) => s + it.monthly.reduce((ss, v) => ss + v, 0), 0);

                  return group.items.map((item, iIdx) => {
                    const isFirst = iIdx === 0;
                    const isLast = iIdx === group.items.length - 1;
                    const itemTotal = Math.round(item.monthly.reduce((s, v) => s + v, 0) * 10) / 10;

                    return (
                      <tr key={`${group.id}-${item.id}`} style={{ backgroundColor: bgColor }}>
                        {isFirst && (
                          <td
                            className="px-3 py-2 align-top sticky left-0 z-10"
                            rowSpan={group.items.length}
                            style={{ borderLeft: `3px solid ${borderColor}`, borderBottom: '2px solid #E5E7EB', backgroundColor: bgColor }}
                          >
                            <div className="flex items-center gap-1">
                              <GripVertical size={12} className="text-gray-300 flex-shrink-0" />
                              <input
                                type="text"
                                value={group.name}
                                onChange={(e) => updateGroupName(gIdx, e.target.value)}
                                className="w-full text-xs font-semibold text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-400 focus:outline-none py-0.5 transition"
                              />
                            </div>
                            {group.items.length > 1 && (
                              <div className="text-[10px] text-gray-400 mt-1 ml-4">
                                소계 {fmt(Math.round(groupTotal * 10) / 10)}
                              </div>
                            )}
                            <div className="flex gap-1 mt-2 ml-4">
                              <button
                                onClick={() => addItem(gIdx)}
                                className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                              >
                                <Plus size={10} /> 항목
                              </button>
                              {groups.length > 1 && (
                                <button
                                  onClick={() => removeGroup(gIdx)}
                                  className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5 ml-2"
                                >
                                  <Trash2 size={10} /> 그룹
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="px-2 py-2" style={{ borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6' }}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemName(gIdx, iIdx, e.target.value)}
                              className="w-full text-xs font-medium text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-400 focus:outline-none py-0.5 transition"
                            />
                          </div>
                        </td>

                        {item.monthly.map((val, mIdx) => (
                          <td
                            key={mIdx}
                            className="px-1 py-1"
                            style={{ borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6' }}
                          >
                            <input
                              type="number"
                              step="any"
                              value={val || ''}
                              onChange={(e) => updateItemMonthly(gIdx, iIdx, mIdx, e.target.value)}
                              placeholder="0"
                              className="w-full text-right text-xs tabular-nums font-medium px-1.5 py-1.5 rounded border border-transparent hover:border-gray-300 focus:border-pink-400 focus:outline-none focus:bg-white bg-transparent transition"
                            />
                          </td>
                        ))}

                        <td
                          className="text-right px-3 py-2 text-xs font-bold tabular-nums"
                          style={{
                            color: item.color,
                            borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6',
                            backgroundColor: `color-mix(in srgb, ${bgColor} 50%, #F9FAFB)`,
                          }}
                        >
                          {fmt(itemTotal)}
                        </td>

                        <td
                          className="text-center px-2 py-2"
                          style={{ borderBottom: isLast ? '2px solid #E5E7EB' : '1px solid #F3F4F6' }}
                        >
                          {group.items.length > 1 && (
                            <button
                              onClick={() => removeItem(gIdx, iIdx)}
                              className="text-gray-300 hover:text-red-400 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}

                <tr className="bg-gray-800 text-white">
                  <td className="px-3 py-3 sticky left-0 bg-gray-800 z-10 font-bold text-xs" colSpan={2}>거래 TTL</td>
                  {grandMonthly.map((val, i) => (
                    <td key={i} className="text-right px-2 py-3 font-bold tabular-nums text-xs">{fmt(Math.round(val * 10) / 10)}</td>
                  ))}
                  <td className="text-right px-3 py-3 font-bold text-xs bg-gray-900">{fmt(Math.round(grandTotal * 10) / 10)}</td>
                  <td className="bg-gray-900"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 상태 메시지 */}
        {saveStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">
            저장 완료! 예산 변동 상세 페이지로 이동합니다…
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={resetChanges}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition ${
              hasChanges
                ? 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={16} /> 초기화
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saveStatus === 'saving' || saveStatus === 'success'}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
              !canSave || saveStatus === 'saving' || saveStatus === 'success'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#D63384] hover:bg-[#D63384]/90 text-white'
            }`}
          >
            <Save size={16} />
            {saveStatus === 'saving' ? '저장 중…' : saveStatus === 'success' ? '저장 완료!' : isNewBreakdown ? '세부 예산 새로 저장' : '세부 예산 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
