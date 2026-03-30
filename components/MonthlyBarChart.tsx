'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface MonthlyData {
  month: string;
  prev: number;
  curr: number;
  diff: number;
}

interface MonthlyBarChartProps {
  data: MonthlyData[];
  height?: number;
}

export default function MonthlyBarChart({
  data,
  height = 400,
}: MonthlyBarChartProps) {
  const getBarColor = (diff: number) => {
    if (diff > 0) return '#D63384'; // pink
    if (diff < 0) return '#1971C2'; // blue
    return '#E9ECEF'; // gray
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">기존:</span> {data.prev.toLocaleString()}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">변경:</span> {data.curr.toLocaleString()}
          </p>
          <p
            className="text-sm font-semibold"
            style={{ color: getBarColor(data.diff) }}
          >
            증감: {data.diff > 0 ? '+' : ''}{data.diff.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#999" />
          <Bar dataKey="prev" fill="#E9ECEF" name="기존" radius={[4, 4, 0, 0]} />
          <Bar dataKey="curr" name="변경" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.diff)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
