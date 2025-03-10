import { useAtom } from "jotai"
import { useSearchParams } from "react-router"
import { collectionsAtom } from "../atoms/jsonAtom"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { useState } from "react"

const Sidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const onSelect = (index: string) => {
    setSearchParams((prev) => {
      prev.set("collection", index)
      return prev
    })
  }
  const [file, setFile] = useState<File | null>(null)
  const [collections, setCollections] = useAtom(collectionsAtom)
  const [open, setOpen] = useState(false)

  const handleAddCollection = () => {
    const collection = file
    if (collection) {
      const reader = new FileReader()
      reader.onload = () => {
        const data = JSON.parse(reader.result as string)
        setCollections((prev) => [...prev, { name: collection.name, data }])
      }
      reader.readAsText(collection)
    }

    setFile(null)
    setOpen(false)
  }

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Collections</h2>
      <ul>
        {collections.map((collection, index) => (
          <li
            key={index}
            className={`p-2 my-1 cursor-pointer hover:bg-gray-700 ${
              searchParams.get("collection") === index.toString() &&
              "bg-gray-600 font-semibold"
            } rounded transition-all duration-200`}
            onClick={() => onSelect(index.toString())}
          >
            {collection.name}
          </li>
        ))}
        <li>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Collection</DialogTitle>
              </DialogHeader>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files![0])}
              />
              <DialogFooter>
                <Button onClick={handleAddCollection}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </li>
        {collections.length === 0 && (
          <p className="text-gray-400">No collections found.</p>
        )}
        <div className="mt-4"></div>
      </ul>
    </aside>
  )
}

export default Sidebar
