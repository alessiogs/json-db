import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { collectionsAtom, relationsAtom } from "../atoms/jsonAtom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Plus, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import RelationsEditor from "./RelationsEditor"

const AppSidebar = () => {
  const [_, setSearchParams] = useSearchParams()
  const onSelect = (index: string) => {
    setSearchParams((prev) => {
      prev.set("collection", index)
      return prev
    })
  }
  const [file, setFile] = useState<File | null>(null)
  const [collections, setCollections] = useAtom(collectionsAtom)
  const [relations] = useAtom(relationsAtom)
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
  }

  const handleRemoveCollection = (index: number) => {
    const newCollections = collections.filter((_, i) => i !== index)
    setCollections(newCollections)
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupAction className="cursor-pointer">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Plus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Collection</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
                <div className="">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setFile(e.target.files![0])}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleAddCollection}>
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {collections.map((collection, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    onClick={() => onSelect(index.toString())}
                    asChild
                  >
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={() => handleRemoveCollection(index)}
                  >
                    <Trash className="hover:text-red-700" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Relations</SidebarGroupLabel>
          <SidebarGroupAction className="cursor-pointer">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Plus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Relation</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
                <RelationsEditor />
                <DialogFooter>
                  <Button variant="outline" onClick={handleAddCollection}>
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {relations.map((_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <span className="cursor-pointer">{index}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
