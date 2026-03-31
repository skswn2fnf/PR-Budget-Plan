'use client';

interface Allocation {
  monthly: number[];
  total: number;
}

interface Version {
  id: string;
  label: string;
  date: string;
  note: string;
  allocations: Record<string, Allocation>;
}

interface VersionTimelineProps {
  versions: Version[];
  selectedId: string;
  onSelect: (id: string) => void;
  months: string[];
}

function getMonthlyDiffs(prev: Version | null, curr: Version, months: string[]) {
  if (!prev) return null;
  const prevMonthly = prev.allocations.adult_viral?.monthly ?? [];
  const currMonthly = curr.allocations.adult_viral?.monthly ?? [];
  return months.map((month, i) => ({
    month,
    prev: prevMonthly[i] ?? 0,
    curr: currMonthly[i] ?? 0,
    diff: (currMonthly[i] ?? 0) - (prevMonthly[i] ?? 0),
  }));
}

export default function VersionTimeline({
  versions,
  selectedId,
  onSelect,
  months,
}: VersionTimelineProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="relative pl-8">
        {/* Vertical connecting line */}
        <div
          className="absolute left-3 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: '#E9ECEF' }}
        />

        {/* Timeline items */}
        <div className="space-y-6">
          {versions.map((version, index) => {
            const prevVersion = index > 0 ? versions[index - 1] : null;
            const diffs = getMonthlyDiffs(prevVersion, version, months);
            const maxAbsDiff = diffs
              ? Math.max(...diffs.map((d) => Math.abs(d.diff)), 1)
              : 1;

            return (
              <div
                key={version.id}
                className="relative cursor-pointer group"
                onClick={() => onSelect(version.id)}
              >
                {/* Dot */}
                <div
                  className="absolute -left-7 top-1 w-5 h-5 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      selectedId === version.id ? '#D63384' : '#D1D5DB',
                    boxShadow:
                      selectedId === version.id
                        ? '0 0 8px rgba(214, 51, 132, 0.3)'
                        : 'none',
                  }}
                />

                {/* Content */}
                <div className="group-hover:translate-x-1 transition-transform">
                  <p className="font-semibold text-gray-800">{version.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{version.date}</p>
                  <p className="text-sm text-gray-600 mt-1">{version.note}</p>

                  {/* Monthly diff summary */}
                  {diffs && (
                    <div className="mt-3 flex items-end gap-1">
                      {diffs.map((d) => {
                        const barHeight = Math.round((Math.abs(d.diff) / maxAbsDiff) * 20);
                        const isUp = d.diff > 0;
                        const isZero = d.diff === 0;
                        return (
                          <div key={d.month} className="flex flex-col items-center" style={{ width: `${100 / months.length}%` }}>
                            {/* Bar */}
                            <div className="relative w-full flex flex-col items-center" style={{ height: 44 }}>
                              {/* Center line */}
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
                              {isZero ? (
                                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
                              ) : isUp ? (
                                <div
                                  className="absolute rounded-sm"
                                  style={{
                                    bottom: 22,
                                    height: Math.max(barHeight, 3),
                                    width: '60%',
                                    backgroundColor: '#D63384',
                                    opacity: 0.7 + (Math.abs(d.diff) / maxAbsDiff) * 0.3,
                                  }}
                                />
                              ) : (
                                <div
                                  className="absolute rounded-sm"
                                  style={{
                                    top: 22,
                                    height: Math.max(barHeight, 3),
                                    width: '60%',
                                    backgroundColor: '#1971C2',
                                    opacity: 0.7 + (Math.abs(d.diff) / maxAbsDiff) * 0.3,
                                  }}
                                />
                              )}
                            </div>
                            {/* Label */}
                            <span className="text-[10px] text-gray-400 mt-0.5 leading-none">{d.month.replace('월', '')}</span>
                            {/* Diff value */}
                            <span
                              className="text-[9px] font-medium leading-none mt-0.5"
                              style={{
                                color: isZero ? '#ADB5BD' : isUp ? '#D63384' : '#1971C2',
                              }}
                            >
                              {isZero ? '—' : `${isUp ? '+' : ''}${d.diff}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
