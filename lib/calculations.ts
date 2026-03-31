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
  return result.map((v) => Math.round(v * 10) / 10);
}

// TTL 합계
export function getTTLTotal(version: BudgetVersion): number {
  return Math.round(Object.values(version.allocations).reduce((sum, a) => sum + a.total, 0) * 10) / 10;
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

// ── 예산 변동 요약 동적 계산 ──

export interface MonthDiff {
  month: string;
  monthIndex: number;
  diff: number;
}

export interface ComputedFocusPeriod {
  label: string;
  monthRange: string;
  prevLabel: string;
  currLabel: string;
  prevOtherPct: number;
  prevFocusPct: number;
  currOtherPct: number;
  currFocusPct: number;
  changePp: number;
}

export interface ComputedChangeCard {
  label: string;
  totalChange: number;
  color: string;
  details: string[];
}

export interface ComputedChangeHighlights {
  focusPeriod: ComputedFocusPeriod;
  increases: ComputedChangeCard;
  decreases: ComputedChangeCard;
  notes: string[];
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function findBestConsecutivePair(diffs: number[]): [number, number] {
  let bestSum = -Infinity;
  let bestStart = 0;
  for (let i = 0; i < diffs.length - 1; i++) {
    const sum = diffs[i] + diffs[i + 1];
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = i;
    }
  }
  return [bestStart, bestStart + 1];
}

export function computeChangeHighlights(
  prev: BudgetVersion,
  curr: BudgetVersion,
  months: string[],
  prevLabel: string,
  currLabel: string
): ComputedChangeHighlights {
  const prevTTL = getTTLMonthly(prev);
  const currTTL = getTTLMonthly(curr);
  const prevTotal = getTTLTotal(prev);
  const currTotal = getTTLTotal(curr);

  const diffs = months.map((_, i) => round1(currTTL[i] - prevTTL[i]));

  const [focusA, focusB] = findBestConsecutivePair(diffs);
  const focusMonths = `${months[focusA].replace('월', '')}~${months[focusB]}`;

  const prevFocusSum = prevTTL[focusA] + prevTTL[focusB];
  const currFocusSum = currTTL[focusA] + currTTL[focusB];
  const prevFocusPct = round1((prevFocusSum / prevTotal) * 100);
  const currFocusPct = round1((currFocusSum / currTotal) * 100);
  const changePp = round1(currFocusPct - prevFocusPct);

  const focusPeriod: ComputedFocusPeriod = {
    label: `${focusMonths} 비중 변화`,
    monthRange: focusMonths,
    prevLabel,
    currLabel,
    prevOtherPct: round1(100 - prevFocusPct),
    prevFocusPct,
    currOtherPct: round1(100 - currFocusPct),
    currFocusPct,
    changePp,
  };

  const increasedMonths: MonthDiff[] = [];
  const decreasedMonths: MonthDiff[] = [];

  diffs.forEach((d, i) => {
    if (d > 0) increasedMonths.push({ month: months[i], monthIndex: i + 1, diff: d });
    if (d < 0) decreasedMonths.push({ month: months[i], monthIndex: i + 1, diff: d });
  });

  const totalIncr = round1(increasedMonths.reduce((s, m) => s + m.diff, 0));
  const totalDecr = round1(decreasedMonths.reduce((s, m) => s + m.diff, 0));

  const incrMonthNames = increasedMonths.map((m) => m.month).join(' / ');
  const decrMonthNames = decreasedMonths.map((m) => m.month).join(' / ');

  const incrDetails = increasedMonths.map(
    (m) => `${m.month} +${round1(m.diff * 100).toLocaleString()}만 (${round1(m.diff)}백만)`
  );
  const decrDetails = decreasedMonths.map(
    (m) => `${m.month} ${round1(m.diff * 100).toLocaleString()}만 (${round1(m.diff)}백만)`
  );

  const increases: ComputedChangeCard = {
    label: `${incrMonthNames} 예산 증액`,
    totalChange: round1(totalIncr * 100),
    color: '#D63384',
    details: incrDetails,
  };

  const decreases: ComputedChangeCard = {
    label: `${decrMonthNames} 예산 감액`,
    totalChange: round1(totalDecr * 100),
    color: '#1971C2',
    details: decrDetails,
  };

  const notes: string[] = [];
  const unchangedMonths = months.filter((_, i) => diffs[i] === 0);
  if (unchangedMonths.length > 0) {
    notes.push(`${unchangedMonths.join(' · ')} 예산 변동 없음`);
  }
  const netChange = round1(totalIncr + totalDecr);
  if (netChange === 0) {
    notes.push('총 예산 변동 없음 (재배분만 발생)');
  } else {
    notes.push(`총 예산 ${netChange > 0 ? '+' : ''}${round1(netChange * 100).toLocaleString()}만 변동`);
  }

  return { focusPeriod, increases, decreases, notes };
}
