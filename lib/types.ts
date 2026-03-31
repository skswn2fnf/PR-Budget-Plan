export interface BudgetMetadata {
  brand: string;
  year: number;
  totalBudget: number;
  currency: string;
  months: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Allocation {
  monthly: number[];
  total: number;
}

export interface Issue {
  name: string;
  months: number[];
  amount: number;
  color: string;
}

export interface BudgetVersion {
  id: string;
  label: string;
  date: string;
  note: string;
  allocations: Record<string, Allocation>;
  issues: Issue[];
}

export interface Insight {
  type: string;
  icon: string;
  title: string;
  months: number[];
  description: string;
  recommendation: string;
}

export interface DetailedItem {
  id: string;
  name: string;
  monthly: number[];
  total: number;
  color: string;
  note?: string;
}

export interface DetailedGroup {
  id: string;
  name: string;
  items: DetailedItem[];
}

export interface BudgetSummaryRow {
  id: string;
  name: string;
  monthly: number[];
  total: number;
  color: string;
}

export interface FocusPeriod {
  label: string;
  prevLabel: string;
  currLabel: string;
  prevOtherPct: number;
  prevFocusPct: number;
  currOtherPct: number;
  currFocusPct: number;
  changePp: number;
}

export interface ChangeCard {
  label: string;
  totalChange: number;
  color: string;
  details: string[];
}

export interface ChangeHighlights {
  focusPeriod: FocusPeriod;
  increases: ChangeCard;
  decreases: ChangeCard;
  notes: string[];
}

export interface VersionBreakdown {
  changeHighlights: ChangeHighlights;
  summary: BudgetSummaryRow[];
  detailed: DetailedGroup[];
}

export interface BudgetData {
  metadata: BudgetMetadata;
  categories: Category[];
  versions: BudgetVersion[];
  insights: Insight[];
  breakdowns: Record<string, VersionBreakdown>;
}

export interface MonthlyComparison {
  month: string;
  monthIndex: number;
  prev: number;
  curr: number;
  diff: number;
  prevPct: number;
  currPct: number;
  changeRate: number;
}
