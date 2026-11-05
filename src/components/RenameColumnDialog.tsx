import { useSetAtom } from "jotai"
import { useState } from "react"
import { relationsAtom, type Collection } from "../atoms/jsonAtom"
import { useUpdateCollection } from "../hooks/useUpdateCollection"
import { renameColumn, renameInRelations } from "../lib/collection"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"

type RenameColumnDialogProps = {
  collection: Collection
  columnKey: string
}

/** A header button showing a column's name; opens a dialog to rename it. */
const RenameColumnDialog = ({ collection, columnKey }: RenameColumnDialogProps) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(columnKey)
  const [error, setError] = useState<string | null>(null)
  const updateCollection = useUpdateCollection(collection.name)
  const setRelations = useSetAtom(relationsAtom)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(columnKey)
      setError(null)
    }
    setOpen(next)
  }

  const handleConfirm = () => {
    const result = renameColumn(collection, columnKey, name)
    if (!result.ok) return setError(result.error)
    const to = name.trim()
    updateCollection(() => result.value)
    setRelations((prev) => renameInRelations(prev, collection.name, columnKey, to))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="cursor-pointer hover:underline"
        title="Rename column"
      >
        {columnKey}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Rename "${columnKey}"`}</DialogTitle>
          <DialogDescription>
            Relations that use this column are updated too.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => event.key === "Enter" && handleConfirm()}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RenameColumnDialog
