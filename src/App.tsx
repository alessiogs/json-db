import AppSidebar from "./components/AppSidebar"
import CollectionEditor from "./components/CollectionEditor"
import ThemeToggle from "./components/ThemeToggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar"

const App = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-screen">
        <header className="flex items-center justify-between p-2">
          <SidebarTrigger />
          <ThemeToggle />
        </header>
        <SidebarInset>
          <main className="p-2 w-full">
            <CollectionEditor />
          </main>
        </SidebarInset>
      </main>
    </SidebarProvider>
  )
}

export default App
