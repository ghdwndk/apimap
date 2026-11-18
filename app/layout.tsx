import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "어디까지 | 장소 간 거리 찾기",
  description: "출발지와 도착지를 검색하고 차량 이동 거리를 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
