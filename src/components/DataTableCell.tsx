import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { collectionsAtom } from "../atoms/jsonAtom"
import CellEditor from "./CellEditor"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

const DataTableCell = ({ row, dataKey }: { row: any; dataKey: string }) => {
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const [collections, setCollections] = useAtom(collectionsAtom)
  const [value, setValue] = useState(row[dataKey])

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
    setOpen(false)
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
          <CellEditor
            value={value}
            setValue={setValue}
            onSave={handleSaveChanges}
          />
          <DialogFooter>
            <Button variant="default" onClick={() => handleSaveChanges(value)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </td>
  )
}

export default DataTableCell
