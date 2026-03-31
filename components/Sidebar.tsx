"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitCompare,
  PieChart,
  Edit3,
  Lightbulb,
  TableProperties,
  PenLine,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/breakdown", label: "예산 변동 상세", icon: TableProperties },
  { href: "/compare", label: "버전 비교", icon: GitCompare },
  { href: "/drilldown", label: "카테고리", icon: PieChart },
  { href: "/editor", label: "예산 편집", icon: Edit3 },
  { href: "/breakdown-editor", label: "세부 예산 편집", icon: PenLine },
  { href: "/insights", label: "인사이트", icon: Lightbulb },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-[#2B2D42] flex flex-col">
      {/* Brand Header */}
      <div className="px-6 py-8 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-white text-lg font-bold">DISCOVERY</span>
          <div className="w-1 h-5 bg-[#D63384]"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#D63384] bg-opacity-20 text-[#D63384]"
                  : "text-[#ADB5BD] hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gray-700">
        <p className="text-xs text-[#ADB5BD]">뉴미디어 PR 예산 8.4억</p>
      </div>
    </aside>
  );
}
