import { create } from "zustand";

// Helper function to get initial theme
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("chat-theme");
  if (savedTheme) return savedTheme;

  // Check for system preference if no saved theme
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Apply theme to document
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const useThemeStore = create((set) => {
  // Get initial theme
  const initialTheme = getInitialTheme();

  // Apply the initial theme immediately
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        localStorage.setItem("chat-theme", newTheme);
        applyTheme(newTheme);
        return { theme: newTheme };
      });
    },
  };
});
