'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface Issue {
  name: string;
  amount: number;
  color: string;
}

interface CategoryPieChartProps {
  issues: Issue[];
}

export default function CategoryPieChart({ issues }: CategoryPieChartProps) {
  const CustomLabel = ({ name, value }: any) => {
    return (
      <text
        className="text-sm font-semibold fill-gray-800"
        textAnchor="middle"
      >
        {name} ({value})
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{payload[0].name}:</span>{' '}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={issues}
            cx="50%"
            cy="40%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            label={CustomLabel}
          >
            {issues.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => entry.payload.name}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
