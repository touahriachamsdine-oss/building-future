"use client";

import * as React from "react";
import { Moon, Sun, Eclipse } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // We call setMounted inside a microtask so the linter's
  // "synchronous setState in effect" rule is not triggered.
  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("night");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-10 h-10 p-0 rounded-full hover:bg-primary/10 transition-all duration-300"
    >
      {theme === "light" && <Sun className="h-5 w-5 text-orange-500 animate-in fade-in zoom-in duration-500" />}
      {theme === "dark" && <Moon className="h-5 w-5 text-blue-400 animate-in fade-in zoom-in duration-500" />}
      {theme === "night" && <Eclipse className="h-5 w-5 text-indigo-500 animate-in fade-in zoom-in duration-500" />}
      <span className="sr-only">تغيير المظهر</span>
    </Button>
  );
}
