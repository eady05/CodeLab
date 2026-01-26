"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function useMountedTheme() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // resolvedTheme은 시스템 설정(다크/라이트)까지 고려한 최종 테마예요.
  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";

  return {
    mounted,
    theme: currentTheme,
    setTheme,
  };
}