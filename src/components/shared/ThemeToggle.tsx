"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMountedTheme } from "@/hooks/use-mounted-theme";

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useMountedTheme(); // 👈 딱 한 줄!

  if (!mounted) {
    return <div className="w-9 h-9" />; // 마운트 전에는 빈 공간 유지
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}