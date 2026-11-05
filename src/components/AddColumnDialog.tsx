import { Plus } from "lucide-react"
import { useState } from "react"
import type { Collection } from "../atoms/jsonAtom"
import { useUpdateCollection } from "../hooks/useUpdateCollection"
import { addColumn } from "../lib/collection"
import { columnKinds, isColumnKind, type ColumnKind } from "../lib/schema"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

/** A header button that opens a dialog to add a column to `collection`. */
const AddColumnDialog = ({ collection }: { collection: Collection }) => {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState("")
  const [kind, setKind] = useState<ColumnKind>("string")
  const [error, setError] = useState<string | null>(null)
  const updateCollection = useUpdateCollection(collection.name)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setKey("")
      setKind("string")
      setError(null)
    }
    setOpen(next)
  }

  const handleKindChange = (value: string) => {
    if (isColumnKind(value)) setKind(value)
  }

  const handleConfirm = () => {
    const result = addColumn(collection, key, kind)
    if (!result.ok) return setError(result.error)
    updateCollection(() => result.value)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Add column">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add column</DialogTitle>
          <DialogDescription>
            Name the column and choose the kind of value it holds.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Column name"
          value={key}
          onChange={(event) => {
            setKey(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => event.key === "Enter" && handleConfirm()}
        />
        <Select value={kind} onValueChange={handleKindChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columnKinds.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add column</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddColumnDialog
