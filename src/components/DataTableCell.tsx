import { useAtom } from "jotai"
import { useState } from "react"
import { collectionsAtom, relationsAtom } from "../atoms/jsonAtom"
import { useSelectedCollectionName } from "../hooks/useSelectedCollection"
import { useUpdateCollection } from "../hooks/useUpdateCollection"
import {
  referenceOptions,
  relationFrom,
  resolveReference,
} from "../lib/reference"
import {
  codecFor,
  isScalarKind,
  readCell,
  type CellValue,
  type Column,
  type Row,
} from "../lib/schema"
import CellEditor from "./CellEditor"
import ReferencePicker from "./ReferencePicker"
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
  const [collections] = useAtom(collectionsAtom)
  const [relations] = useAtom(relationsAtom)

  const collectionName = useSelectedCollectionName()
  const updateCollection = useUpdateCollection(collectionName)
  const cell = readCell(row, column)

  // A column a relation points from holds references to another collection.
  const relation =
    collectionName === null
      ? undefined
      : relationFrom(relations, collectionName, column.key)
  const reference =
    relation && cell.status === "valid"
      ? resolveReference(collections, relation, cell.value)
      : undefined

  const handleSave = (value: CellValue) => {
    updateCollection((current) => ({
      ...current,
      data: current.data.map((item) =>
        item.id === row.id ? { ...item, [column.key]: value } : item
      ),
    }))
    setOpen(false)
  }

  const display =
    cell.status === "missing"
      ? "-"
      : cell.status === "invalid"
        ? String(cell.raw)
        : codecFor(column.kind).format(cell.value)

  const problem =
    cell.status === "invalid"
      ? `Expected ${column.kind}`
      : reference?.status === "dangling"
        ? reference.reason
        : undefined

  const initial = cell.status === "valid" ? cell.value : undefined

  return (
    <TableCell>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={`w-full h-full text-left cursor-pointer hover:underline ${
            problem ? "text-destructive" : ""
          }`}
          title={problem}
        >
          {display}
          {reference?.status === "found" && (
            <span className="ml-1.5 text-muted-foreground">
              {reference.label}
            </span>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{column.key}</DialogTitle>
          {relation && isScalarKind(column.kind) ? (
            <>
              <DialogDescription>
                Pick the {relation.refersTo.collection} row this points at.
              </DialogDescription>
              <ReferencePicker
                options={referenceOptions(collections, relation, column.kind)}
                initial={initial}
                onSave={handleSave}
              />
            </>
          ) : (
            <>
              <DialogDescription>
                Edit this {column.kind} value. Press Enter to save.
              </DialogDescription>
              <CellEditor
                kind={column.kind}
                initial={initial}
                onSave={handleSave}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </TableCell>
  )
}

export default DataTableCell
