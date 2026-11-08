import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import {
  collectionsAtom,
  emptyRelation,
  makeCollection,
  relationsAtom,
  type Relation,
} from "../atoms/jsonAtom"
import {
  describeRelation,
  relationError,
  removeCollectionRelations,
} from "../lib/relation"
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
  const [relationDraft, setRelationDraft] = useState<Relation>(emptyRelation)
  // Index of the relation being edited; null while adding a new one.
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const editing = editingIndex === null ? undefined : relations[editingIndex]
  const draftError = relationError(collections, relations, relationDraft, editing)

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

  const openRelationDialog = (index: number | null) => {
    setEditingIndex(index)
    setRelationDraft(index === null ? emptyRelation : relations[index])
    setRelationDialogOpen(true)
  }

  const handleSaveRelation = () => {
    if (draftError) return
    setRelations((prev) =>
      editingIndex === null
        ? [...prev, relationDraft]
        : prev.map((relation, index) =>
            index === editingIndex ? relationDraft : relation
          )
    )
    setRelationDialogOpen(false)
  }

  const handleRemoveRelation = (index: number) => {
    setRelations((prev) => prev.filter((_, i) => i !== index))
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
    // Relations from or to a removed collection can never resolve again.
    setRelations((prev) => removeCollectionRelations(prev, name))
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
          <Dialog
            open={collectionDialogOpen}
            onOpenChange={setCollectionDialogOpen}
          >
            <DialogTrigger asChild>
              <SidebarGroupAction className="cursor-pointer" title="Add collection">
                <Plus />
              </SidebarGroupAction>
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
                    <Trash className="hover:text-destructive" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Relations</SidebarGroupLabel>
          <SidebarGroupAction
            className="cursor-pointer"
            title="Add relation"
            disabled={collections.length < 2}
            onClick={() => openRelationDialog(null)}
          >
            <Plus />
          </SidebarGroupAction>
          <Dialog open={relationDialogOpen} onOpenChange={setRelationDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit relation" : "Add relation"}
                </DialogTitle>
                <DialogDescription>
                  Make a column reference rows of another collection.
                </DialogDescription>
              </DialogHeader>
              <RelationsEditor
                formData={relationDraft}
                setFormData={setRelationDraft}
                editing={editing}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRelationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={draftError !== undefined}
                  title={draftError}
                  onClick={handleSaveRelation}
                >
                  {editing ? "Save" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <SidebarGroupContent>
            <SidebarMenu>
              {relations.length === 0 && (
                <p className="px-2 text-xs text-muted-foreground">
                  No relations yet.
                </p>
              )}
              {relations.map((relation, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    title="Edit relation"
                    onClick={() => openRelationDialog(index)}
                  >
                    <span className="truncate">{describeRelation(relation)}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    title="Remove relation"
                    onClick={() => handleRemoveRelation(index)}
                  >
                    <Trash className="hover:text-destructive" />
                  </SidebarMenuAction>
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
