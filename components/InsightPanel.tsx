'use client';

import { CloudRain, TrendingUp, Sparkles, Target } from 'lucide-react';

interface Insight {
  type: string;
  icon: string;
  title: string;
  months: number[];
  description: string;
  recommendation: string;
}

interface InsightPanelProps {
  insights: Insight[];
  monthLabels: string[];
}

export default function InsightPanel({ insights, monthLabels }: InsightPanelProps) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'cloud-rain':
        return <CloudRain className="w-6 h-6" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'target':
        return <Target className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'weather_risk':
        return 'text-blue-500';
      case 'trend':
        return 'text-pink-500';
      case 'issue':
        return 'text-orange-500';
      case 'strategy':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMonthNames = (monthIndices: number[]) => {
    return monthIndices
      .map((idx) => monthLabels[idx])
      .join(', ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm p-5 flex flex-col"
        >
          {/* Header with Icon and Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className={getIconColor(insight.type)}>
              {getIconComponent(insight.icon)}
            </div>
            <h3 className="font-bold text-gray-800 text-base">
              {insight.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 flex-grow">
            {insight.description}
          </p>

          {/* Month Badges */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              적용 월: {getMonthNames(insight.months)}
            </p>
          </div>

          {/* Recommendation Section */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              전략 제언
            </p>
            <p className="text-sm text-gray-700">
              {insight.recommendation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
