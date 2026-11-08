import { useAtom } from "jotai"
import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { themeAtom } from "../atoms/themeAtom"
import { Button } from "./ui/button"

/** Switches between the light and dark theme. */
const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom)
  const isDark = theme === "dark"

  // Keep the <html> class in sync so the `.dark` palette in index.css applies.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeToggle
