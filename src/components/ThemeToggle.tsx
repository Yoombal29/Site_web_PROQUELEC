import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

export function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded transition-all duration-300 hover:scale-110"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
