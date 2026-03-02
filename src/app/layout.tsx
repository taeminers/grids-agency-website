import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grids Agency [그리즈 에이전시]",
  description: "서울대학교 컴퓨터공학부 출신 팀. AI 영상 제작부터 업무 효율을 극대화하는 AI 자동화 시스템 구축까지. 단순 웹사이트 제작을 넘어, 기업의 생산성을 혁신하는 맞춤형 내부 관리 툴과 워크플로우를 설계합니다. 그리즈 에이전시와 함께 비즈니스 운영의 초격차를 만드세요.",
  openGraph: {
    title: "Grids Agency [그리즈 에이전시]",
    description: "서울대학교 컴퓨터공학부 출신 팀. AI 영상 제작부터 업무 효율을 극대화하는 AI 자동화 시스템 구축까지. 단순 웹사이트 제작을 넘어, 기업의 생산성을 혁신하는 맞춤형 내부 관리 툴과 워크플로우를 설계합니다. 그리즈 에이전시와 함께 비즈니스 운영의 초격차를 만드세요.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grids Agency",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
