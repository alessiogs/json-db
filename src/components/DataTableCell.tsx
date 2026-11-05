import { useAtom } from "jotai"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { collectionsAtom, relationsAtom } from "../atoms/jsonAtom"
import {
  codecFor,
  readCell,
  type CellValue,
  type Column,
  type Row,
} from "../lib/schema"
import CellEditor from "./CellEditor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { TableCell } from "./ui/table"

type DataTableCellProps = {
  row: Row
  column: Column
}

const DataTableCell = ({ row, column }: DataTableCellProps) => {
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const [collections, setCollections] = useAtom(collectionsAtom)
  const [relations] = useAtom(relationsAtom)

  const collectionIndex = Number(searchParams.get("collection"))
  const collection = collections[collectionIndex]
  const cell = readCell(row, column)

  const handleSave = (value: CellValue) => {
    setCollections((prev) =>
      prev.map((current, index) =>
        index !== collectionIndex
          ? current
          : {
              ...current,
              data: current.data.map((item) =>
                item.id === row.id ? { ...item, [column.key]: value } : item
              ),
            }
      )
    )
    setOpen(false)
  }

  const getDisplay = (): string => {
    if (cell.status === "missing") return "-"
    if (cell.status === "invalid") return String(cell.raw)

    const relation = relations.find(
      (item) =>
        item.element.collection === collection?.name &&
        item.element.key === column.key
    )
    if (relation) {
      const alias = collections
        .find((other) => other.name === relation.refersTo.collection)
        ?.data.find((refRow) => refRow[relation.refersTo.key] === cell.value)?.[
        relation.alias
      ]
      if (alias !== undefined) return String(alias)
    }
    return codecFor(column.kind).format(cell.value)
  }

  return (
    <TableCell>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={`w-full h-full text-left cursor-pointer hover:underline ${
            cell.status === "invalid" ? "text-destructive" : ""
          }`}
          title={
            cell.status === "invalid" ? `Expected ${column.kind}` : undefined
          }
        >
          {getDisplay()}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{column.key}</DialogTitle>
          <DialogDescription>
            Edit this {column.kind} value. Press Enter to save.
          </DialogDescription>
          <CellEditor
            kind={column.kind}
            initial={cell.status === "valid" ? cell.value : undefined}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </TableCell>
  )
}

export default DataTableCell
