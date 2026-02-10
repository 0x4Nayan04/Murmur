import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="flex size-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-base-200 active:scale-95"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      type="button"
    >
      <div className="relative size-5 overflow-hidden">
        <Sun
          className={`absolute inset-0 size-5 transition-all duration-300 ease-out ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-75 opacity-0"
          } text-amber-500`}
        />
        <Moon
          className={`absolute inset-0 size-5 transition-all duration-300 ease-out ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-75 opacity-0"
          } text-indigo-400`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
