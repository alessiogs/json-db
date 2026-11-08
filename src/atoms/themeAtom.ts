import { atom } from "jotai"

export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "theme"

/**
 * The saved theme, or the system preference when nothing is saved.
 * index.html runs the same check before React loads, so the page never
 * flashes the wrong theme.
 */
const readInitialTheme = (): Theme => {
  try {
    // Older builds saved the value JSON-encoded ("\"dark\""), so strip quotes.
    const saved = localStorage.getItem(THEME_STORAGE_KEY)?.replaceAll('"', "")
    if (saved === "light" || saved === "dark") return saved
  } catch {
    // Storage can be blocked (private mode, disabled cookies); fall through.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const baseThemeAtom = atom<Theme>(readInitialTheme())

/** Current colour theme; writing it also saves the choice. */
export const themeAtom = atom(
  (get) => get(baseThemeAtom),
  (_get, set, theme: Theme) => {
    set(baseThemeAtom, theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Not saved; the choice still applies for this visit.
    }
  }
)
