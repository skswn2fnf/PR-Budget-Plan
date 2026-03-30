'use client';

interface Version {
  id: string;
  label: string;
  date: string;
  note: string;
}

interface VersionTimelineProps {
  versions: Version[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function VersionTimeline({
  versions,
  selectedId,
  onSelect,
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
          {versions.map((version, index) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
