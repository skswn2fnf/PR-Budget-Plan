'use client';

import { useState, useEffect } from 'react';

interface BudgetEditorProps {
  months: string[];
  monthly: number[];
  categoryTotal: number;
  onUpdate: (newMonthly: number[]) => void;
  label: string;
  readOnly?: boolean;
}

export default function BudgetEditor({
  months,
  monthly,
  categoryTotal,
  onUpdate,
  label,
  readOnly = false,
}: BudgetEditorProps) {
  const [values, setValues] = useState<number[]>(monthly);
  const [hasWarning, setHasWarning] = useState(false);

  const sum = values.reduce((acc, val) => acc + val, 0);

  useEffect(() => {
    setValues(monthly);
  }, [monthly]);

  useEffect(() => {
    setHasWarning(sum !== categoryTotal);
  }, [sum, categoryTotal]);

  const handleInputChange = (index: number, newValue: string) => {
    if (readOnly) return;
    const numValue = newValue === '' ? 0 : parseFloat(newValue);
    const newValues = [...values];
    newValues[index] = isNaN(numValue) ? 0 : numValue;
    setValues(newValues);
    onUpdate(newValues);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getPercentage = (value: number) => {
    return sum > 0 ? ((value / sum) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <span className="text-xl font-bold text-gray-900">{formatNumber(sum)}</span>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          {/* Month Headers */}
          <thead>
            <tr>
              {months.map((month, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-center border border-gray-300 bg-gray-50 font-semibold text-gray-700"
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Input Row */}
            <tr>
              {months.map((_, idx) => (
                <td key={idx} className="px-3 py-3 border border-gray-300">
                  <input
                    type="number"
                    step="any"
                    value={values[idx]}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    readOnly={readOnly}
                    className={`w-full px-3 py-2 border-2 rounded-md text-right font-medium ${
                      readOnly
                        ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-default'
                        : 'border-pink-300 focus:outline-none focus:border-pink-500'
                    }`}
                  />
                </td>
              ))}
            </tr>

            {/* Percentage Row */}
            <tr className="bg-gray-50">
              {months.map((_, idx) => (
                <td
                  key={idx}
                  className="px-3 py-2 text-center border border-gray-300 text-xs text-gray-600"
                >
                  {getPercentage(values[idx])}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Warning Message */}
      {hasWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ 합계가 {label} 예산과 일치하지 않습니다. (현재: {formatNumber(sum)} / 목표: {formatNumber(categoryTotal)})
          </p>
        </div>
      )}

      {/* Sum Row */}
      <div className="mb-6 p-3 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">합계</span>
          <span className="font-bold text-lg text-gray-900">{formatNumber(sum)}</span>
        </div>
      </div>

    </div>
  );
}
