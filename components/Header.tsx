"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Version {
  id: string;
  label: string;
}

interface HeaderProps {
  title: string;
  versions?: Version[];
  selectedVersionId?: string;
  onVersionChange?: (versionId: string) => void;
}

export default function Header({
  title,
  versions = [],
  selectedVersionId = "",
  onVersionChange,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>

      {versions.length > 0 && (
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            {selectedVersion?.label || "버전 선택"}
            <ChevronDown size={16} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onVersionChange?.(v.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                    selectedVersionId === v.id
                      ? "font-semibold text-brand-pink bg-brand-pinkLight"
                      : "text-gray-700"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
