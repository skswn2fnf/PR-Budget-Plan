import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'budget.json');

function readBudgetData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeBudgetData(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
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
