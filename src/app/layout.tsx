import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner" // 경로 확인!
import { Providers } from "@/components/providers";
import "./globals.css";
import Script from "next/script"; // 1. Script 임포트
import Navbar from "@/components/shared/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeLab | AI 알고리즘 채점",
  description: "Gemini AI와 함께하는 알고리즘 학습",
  icons: {
    icon: "/icon.png", // public 폴더에 넣었을 경우
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1"> {/* children이 남은 공간을 다 차지함 */}
              {children}
            </main>
          </div>
          <Toaster position="top-center" richColors />
        </Providers>
        <Script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
