import { BudgetVersion, MonthlyComparison } from "./types";

// 특정 카테고리의 월별 합계
export function getCategoryTotal(version: BudgetVersion, categoryId: string): number {
  return version.allocations[categoryId]?.total ?? 0;
}

// 전체 TTL 월별 합산
export function getTTLMonthly(version: BudgetVersion): number[] {
  const categories = Object.keys(version.allocations);
  const length = version.allocations[categories[0]]?.monthly.length ?? 8;
  const result: number[] = new Array(length).fill(0);

  for (const catId of categories) {
    const monthly = version.allocations[catId]?.monthly ?? [];
    for (let i = 0; i < monthly.length; i++) {
      result[i] += monthly[i];
    }
  }
  return result;
}

// TTL 합계
export function getTTLTotal(version: BudgetVersion): number {
  return Object.values(version.allocations).reduce((sum, a) => sum + a.total, 0);
}

// 비중 계산 (%)
export function calcPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

// 증감률 계산 (%)
export function calcChangeRate(prev: number, curr: number): number {
  if (prev === 0) return 0;
  return Math.round(((curr / prev) - 1) * 1000) / 10;
}

// 두 버전의 월별 비교 데이터 생성
export function compareVersions(
  prev: BudgetVersion,
  curr: BudgetVersion,
  categoryId: string,
  months: string[]
): MonthlyComparison[] {
  const prevMonthly = prev.allocations[categoryId]?.monthly ?? [];
  const currMonthly = curr.allocations[categoryId]?.monthly ?? [];
  const prevTotal = prev.allocations[categoryId]?.total ?? 0;
  const currTotal = curr.allocations[categoryId]?.total ?? 0;

  return months.map((month, i) => ({
    month,
    monthIndex: i + 1,
    prev: prevMonthly[i] ?? 0,
    curr: currMonthly[i] ?? 0,
    diff: Math.round(((currMonthly[i] ?? 0) - (prevMonthly[i] ?? 0)) * 10) / 10,
    prevPct: calcPercentage(prevMonthly[i] ?? 0, prevTotal),
    currPct: calcPercentage(currMonthly[i] ?? 0, currTotal),
    changeRate: calcChangeRate(prevMonthly[i] ?? 0, currMonthly[i] ?? 0),
  }));
}

// TTL 기준 두 버전 비교
export function compareVersionsTTL(
  prev: BudgetVersion,
  curr: BudgetVersion,
  months: string[]
): MonthlyComparison[] {
  const prevMonthly = getTTLMonthly(prev);
  const currMonthly = getTTLMonthly(curr);
  const prevTotal = getTTLTotal(prev);
  const currTotal = getTTLTotal(curr);

  return months.map((month, i) => ({
    month,
    monthIndex: i + 1,
    prev: prevMonthly[i] ?? 0,
    curr: currMonthly[i] ?? 0,
    diff: Math.round(((currMonthly[i] ?? 0) - (prevMonthly[i] ?? 0)) * 10) / 10,
    prevPct: calcPercentage(prevMonthly[i] ?? 0, prevTotal),
    currPct: calcPercentage(currMonthly[i] ?? 0, currTotal),
    changeRate: calcChangeRate(prevMonthly[i] ?? 0, currMonthly[i] ?? 0),
  }));
}

// 증액 합계
export function totalIncrease(comparisons: MonthlyComparison[]): number {
  return Math.round(comparisons.filter(c => c.diff > 0).reduce((s, c) => s + c.diff, 0) * 10) / 10;
}

// 감액 합계
export function totalDecrease(comparisons: MonthlyComparison[]): number {
  return Math.round(comparisons.filter(c => c.diff < 0).reduce((s, c) => s + c.diff, 0) * 10) / 10;
}

// 피크 월 찾기
export function findPeakMonth(monthly: number[], months: string[]): { month: string; value: number } {
  let maxIdx = 0;
  for (let i = 1; i < monthly.length; i++) {
    if (monthly[i] > monthly[maxIdx]) maxIdx = i;
  }
  return { month: months[maxIdx], value: monthly[maxIdx] };
}

// 숫자 포맷 (백만원 → 억 or 만)
export function formatBudget(million: number): string {
  if (million >= 100) {
    const eok = million / 100;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  }
  return `${Math.round(million * 100) / 100}백만`;
}

// +/- 부호 포맷
export function formatDiff(value: number): string {
  if (value === 0) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value * 10) / 10}`;
}

export function formatPct(value: number): string {
  if (value === 0) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
