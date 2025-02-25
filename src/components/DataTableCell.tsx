import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { collectionsAtom } from "../atoms/jsonAtom"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"

const DataTableCell = ({ row, dataKey }: { row: any; dataKey: string }) => {
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const [collections, setCollections] = useAtom(collectionsAtom)

  const handleSaveChanges = (updatedValue: string | number | boolean) => {
    const collectionIndex = parseInt(searchParams.get("collection")!)
    const collection = collections[collectionIndex]

    const newCollection = {
      ...collection,
      data: collection.data.map((item: any) =>
        item.id === row.id ? { ...item, [dataKey]: updatedValue } : item
      ),
    }

    const newCollections = [
      ...collections.slice(0, collectionIndex),
      newCollection,
      ...collections.slice(collectionIndex + 1),
    ]

    setCollections(newCollections)
    setOpen(false) // Close the dialog after saving changes
  }

  return (
    <td className="border border-gray-300">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="px-4 py-2 w-full h-full text-left cursor-pointer">
          {row[dataKey] !== undefined ? row[dataKey].toString() : "-"}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{dataKey}</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Press Enter to save.
          </DialogDescription>
          <CellEditor initialValue={row[dataKey]} onSave={handleSaveChanges} />
          <DialogFooter>
            <Button variant="default" onClick={() => setOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </td>
  )
}

const CellEditor = ({
  initialValue,
  onSave,
}: {
  initialValue: string | number | boolean
  onSave: (value: string | number | boolean) => void
}) => {
  const [value, setValue] = useState(initialValue)
  const dataType = typeof initialValue
  let inputType = "text"

  switch (dataType) {
    case "number":
      inputType = "number"
      break
    case "boolean":
      inputType = "checkbox"
      break
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSave(value) // Save the updated value and trigger dialog close in parent
    }
  }

  if (typeof initialValue === "boolean") return null
  return (
    <Input
      className="w-full"
      type={inputType}
      value={initialValue}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

export default DataTableCell
