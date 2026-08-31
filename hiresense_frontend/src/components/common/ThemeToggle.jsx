import { useTheme } from "../../context/useTheme.js";

function ThemeToggle() {
  const {
    theme,
    toggleTheme
  } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        px-3
        py-2
        text-sm
        font-medium
        transition-all
        duration-300
        hover:scale-105
      "
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
        color: "var(--text-primary)"
      }}
      aria-label="Toggle theme"
    >
      <span className="text-base">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>

      <span>
        {theme === "dark"
          ? "Sky White"
          : "Dark"}
      </span>
    </button>
  );
}

export default ThemeToggle;