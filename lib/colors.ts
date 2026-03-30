// PPT에서 사용한 컬러 팔레트 — 대시보드에도 동일하게 적용
export const COLORS = {
  dark: "#2B2D42",
  darkAlt: "#3D3F56",
  white: "#FFFFFF",
  offWhite: "#F8F9FA",
  lightGray: "#E9ECEF",
  midGray: "#868E96",
  pink: "#D63384",
  pinkLight: "#FFF0F6",
  blue: "#1971C2",
  blueLight: "#E7F5FF",
  yellow: "#FFC107",
  yellowBg: "#FFF8E1",
  text: "#212529",
  textSub: "#495057",
} as const;

// 증감 값에 따른 색상 반환
export function getDiffColor(value: number): string {
  if (value > 0) return COLORS.pink;
  if (value < 0) return COLORS.blue;
  return COLORS.midGray;
}

// 증감 값에 따른 배경색 반환
export function getDiffBgColor(value: number): string {
  if (value > 0) return COLORS.pinkLight;
  if (value < 0) return COLORS.blueLight;
  return COLORS.lightGray;
}

// 차트 바 색상
export function getBarColor(diff: number, isUnchanged: boolean): string {
  if (isUnchanged) return COLORS.lightGray;
  if (diff > 0) return COLORS.pink;
  if (diff < 0) return COLORS.blue;
  return COLORS.midGray;
}
