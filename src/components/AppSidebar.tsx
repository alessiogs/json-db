import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import {
  collectionsAtom,
  emptyRelation,
  isCompleteRelation,
  makeCollection,
  relationsAtom,
} from "../atoms/jsonAtom"
import { parseRows } from "../lib/schema"
import { download, toDbJson, toTypeScript } from "../lib/export"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Download, FileCode, Plus, Trash } from "lucide-react"
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
  const [searchParams, setSearchParams] = useSearchParams()
  const onSelect = (name: string) => {
    setSearchParams((prev) => {
      prev.set("collection", name)
      return prev
    })
  }
  const [file, setFile] = useState<File | null>(null)
  const [collections, setCollections] = useAtom(collectionsAtom)
  const [relations, setRelations] = useAtom(relationsAtom)
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const [relationDialogOpen, setRelationDialogOpen] = useState(false)
  const [relationDraft, setRelationDraft] = useState(emptyRelation)

  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleAddCollection = async () => {
    if (!file) return
    const rows = parseRows(await file.text())
    if (!rows.ok) return setUploadError(rows.error)

    const name = file.name.replace(/\.json$/i, "")
    if (collections.some((collection) => collection.name === name)) {
      return setUploadError(`A collection named "${name}" already exists`)
    }
    setCollections((prev) => [...prev, makeCollection(name, rows.value)])
    setUploadError(null)
    setCollectionDialogOpen(false)
  }

  const handleAddRelation = () => {
    if (!isCompleteRelation(relationDraft)) return
    setRelations((prev) => [...prev, relationDraft])
    setRelationDraft(emptyRelation)
    setRelationDialogOpen(false)
  }

  const hasCollections = collections.length > 0

  const handleExportJson = () => {
    const json = JSON.stringify(toDbJson(collections), null, 2) + "\n"
    download("db.json", json, "application/json")
  }

  const handleExportTypes = () => {
    download("db.types.ts", toTypeScript(collections), "text/plain")
  }

  const handleRemoveCollection = (name: string) => {
    setCollections((prev) => prev.filter((collection) => collection.name !== name))
    if (searchParams.get("collection") === name) {
      setSearchParams((prev) => {
        prev.delete("collection")
        return prev
      })
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupAction className="cursor-pointer">
            <Dialog
              open={collectionDialogOpen}
              onOpenChange={setCollectionDialogOpen}
            >
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
                    onChange={(e) => {
                      setFile(e.target.files?.[0] ?? null)
                      setUploadError(null)
                    }}
                  />
                  {uploadError && (
                    <p className="mt-2 text-sm text-destructive">
                      {uploadError}
                    </p>
                  )}
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
              {collections.map((collection) => (
                <SidebarMenuItem key={collection.name}>
                  <SidebarMenuButton
                    onClick={() => onSelect(collection.name)}
                    asChild
                  >
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={() => handleRemoveCollection(collection.name)}
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
            <Dialog
              open={relationDialogOpen}
              onOpenChange={setRelationDialogOpen}
            >
              <DialogTrigger asChild>
                <Plus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Relation</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
                <RelationsEditor
                  formData={relationDraft}
                  setFormData={setRelationDraft}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    disabled={!isCompleteRelation(relationDraft)}
                    onClick={handleAddRelation}
                  >
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
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasCollections}
            onClick={handleExportJson}
          >
            <Download />
            Export db.json
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasCollections}
            onClick={handleExportTypes}
          >
            <FileCode />
            Export types.ts
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
