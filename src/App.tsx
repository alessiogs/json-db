import CollectionEditor from "./components/CollectionEditor"
import Navbar from "./components/Navbar"
import RelationsEditor from "./components/RelationsEditor"
import Sidebar from "./components/Sidebar"

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 h-screen w-full p-4">
          <RelationsEditor />
          <CollectionEditor />
        </div>
      </div>
    </div>
  )
}

export default App
