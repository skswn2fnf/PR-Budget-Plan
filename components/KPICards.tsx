'use client';

import { TrendingUp } from 'lucide-react';

interface KPICardsProps {
  totalBudget: number;
  adultTotal: number;
  peakMonth: string;
  peakValue: number;
  totalIncrease: number;
  totalDecrease: number;
}

export default function KPICards({
  totalBudget,
  adultTotal,
  peakMonth,
  peakValue,
  totalIncrease,
  totalDecrease,
}: KPICardsProps) {
  const formatEok = (value: number) => {
    return (value / 100).toFixed(1);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Card 1: 총 예산 (TTL) */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-3">총 예산 (TTL)</p>
        <p className="text-2xl font-bold" style={{ color: '#2B2D42' }}>
          {formatEok(totalBudget)}억
        </p>
      </div>

      {/* Card 2: 성인 바이럴 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-3">성인 바이럴</p>
        <p className="text-2xl font-bold" style={{ color: '#2B2D42' }}>
          {formatEok(adultTotal)}억
        </p>
      </div>

      {/* Card 3: 피크 월 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-3">피크 월</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold" style={{ color: '#D63384' }}>
            {peakMonth}
          </p>
          <TrendingUp size={20} style={{ color: '#D63384' }} />
        </div>
        <p className="text-sm text-gray-600 mt-1">{formatEok(peakValue)}억</p>
      </div>

      {/* Card 4: 증감 현황 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-3">증감 현황</p>
        <div className="flex items-center gap-4">
          <div>
            <p
              className="text-2xl font-bold"
              style={{ color: '#D63384' }}
            >
              +{formatEok(totalIncrease)}억
            </p>
          </div>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ color: '#1971C2' }}
            >
              {formatEok(totalDecrease)}억
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
