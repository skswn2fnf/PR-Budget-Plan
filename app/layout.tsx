import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "뉴미디어 PR 예산 대시보드",
  description: "Discovery Expedition 뉴미디어 PR 예산 관리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
