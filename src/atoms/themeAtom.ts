import { atomWithStorage } from "jotai/utils"

// Atom for theme state (light/dark mode)
export const themeAtom = atomWithStorage<"light" | "dark">("theme", "light")
