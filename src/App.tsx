import AppSidebar from "./components/AppSidebar"
import CollectionEditor from "./components/CollectionEditor"
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
        <header className="flex p-2">
          <SidebarTrigger />
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
