import { useAtom } from "jotai"
import { themeAtom } from "../atoms/themeAtom"
import { Sun, Moon } from "lucide-react"

const Navbar = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    document.documentElement.classList.toggle("dark")
  }

  return (
    <nav className="w-full p-4 bg-gray-900 text-white flex justify-between items-center">
      <h1 className="text-lg font-bold">JSON Collection Manager</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </nav>
  )
}

export default Navbar
