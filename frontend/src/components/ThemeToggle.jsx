import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ThemeToggle = () => {
  // Use the centralized theme store instead of component state
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Apply the theme to document when it changes in the store
    document.documentElement.setAttribute("data-theme", theme);

    // Also add or remove the "dark" class on the document for broader compatibility
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-base-200 hover:bg-base-300 transition-colors duration-300 group"
      aria-label="Toggle theme"
      type="button">
      <div className="relative size-5 overflow-hidden">
        <Sun
          className={`absolute size-full transform transition-all duration-500 ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          } text-amber-500`}
        />
        <Moon
          className={`absolute size-full transform transition-all duration-500 ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          } text-indigo-400`}
        />
      </div>
      <span className="sr-only">
        {theme === "light" ? "Dark" : "Light"} mode
      </span>

      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-base-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Switch to {theme === "light" ? "night" : "day"} mode
      </span>
    </button>
  );
};

export default ThemeToggle;
