import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Where the app is served. CI sets BASE_PATH to deploy develop under /dev/.
  base: process.env.BASE_PATH ?? "/json-db/",
})
