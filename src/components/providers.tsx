'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* attribute="class": Tailwind의 dark: 클래스를 제어합니다.
        defaultTheme="dark": 기본 테마를 다크모드로 설정합니다.
        enableSystem={true}: 사용자 OS 설정을 따라갈지 여부입니다.
      */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}