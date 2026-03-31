import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BUNDLED_PATH = path.join(process.cwd(), 'data', 'budget.json');
const isVercel = !!process.env.VERCEL;
const TMP_PATH = '/tmp/budget.json';

function getDataPath(): string {
  if (!isVercel) return BUNDLED_PATH;
  if (!fs.existsSync(TMP_PATH)) {
    fs.copyFileSync(BUNDLED_PATH, TMP_PATH);
  }
  return TMP_PATH;
}

function readBudgetData() {
  const raw = fs.readFileSync(getDataPath(), 'utf-8');
  return JSON.parse(raw);
}

function writeBudgetData(data: any) {
  const target = isVercel ? TMP_PATH : BUNDLED_PATH;
  fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: 예산 데이터 조회
export async function GET() {
  try {
    const data = readBudgetData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '데이터를 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 버전 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = readBudgetData();

    const newVersion = {
      id: `v${data.versions.length + 1}`,
      label: body.label || `변경 (${new Date().toISOString().slice(5, 10).replace('-', '.')})`,
      date: new Date().toISOString().split('T')[0],
      note: body.note || '',
      allocations: body.allocations,
      issues: body.issues || data.versions[data.versions.length - 1].issues,
    };

    data.versions.push(newVersion);
    writeBudgetData(data);

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error) {
    return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 });
  }
}

// PATCH: breakdowns 세부 예산 저장
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { versionId, breakdown } = body;
    if (!versionId || !breakdown) {
      return NextResponse.json({ error: 'versionId와 breakdown이 필요합니다.' }, { status: 400 });
    }

    const data = readBudgetData();
    if (!data.breakdowns) data.breakdowns = {};
    data.breakdowns[versionId] = breakdown;
    writeBudgetData(data);

    return NextResponse.json({ success: true, versionId });
  } catch (error) {
    return NextResponse.json({ error: '세부 예산 저장에 실패했습니다.' }, { status: 500 });
  }
}
