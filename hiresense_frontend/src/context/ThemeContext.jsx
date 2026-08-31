import {
  createContext,
  useEffect,
  useState
} from "react";

export const ThemeContext =
  createContext(null);

export function ThemeProvider({
  children
}) {
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem(
        "hiresense-theme"
      ) || "dark"
    );
  });

  useEffect(() => {
    document.documentElement.classList.remove(
      "dark",
      "light"
    );

    document.documentElement.classList.add(
      theme
    );

    localStorage.setItem(
      "hiresense-theme",
      theme
    );
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark"
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}