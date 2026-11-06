import { useMemo, useState } from "react"
import type { Collection } from "../atoms/jsonAtom"
import { useUpdateCollection } from "../hooks/useUpdateCollection"
import {
  columnKinds,
  convertColumn,
  isColumnKind,
  type Column,
  type ColumnKind,
} from "../lib/schema"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type ColumnKindPickerProps = {
  collection: Collection
  column: Column
}

/** A header trigger that opens a dialog to change a column's kind. */
const ColumnKindPicker = ({ collection, column }: ColumnKindPickerProps) => {
  const [open, setOpen] = useState(false)
  const [selectedKind, setSelectedKind] = useState<ColumnKind>(column.kind)
  const updateCollection = useUpdateCollection(collection.name)

  // Only preview while the dialog is open: every header has a picker.
  const conversion = useMemo(
    () => (open ? convertColumn(collection.data, column, selectedKind) : null),
    [open, collection.data, column, selectedKind]
  )
  const total = useMemo(
    () => collection.data.filter((row) => row[column.key] !== undefined).length,
    [collection.data, column.key]
  )

  const handleOpenChange = (next: boolean) => {
    if (next) setSelectedKind(column.kind)
    setOpen(next)
  }

  const handleKindChange = (value: string) => {
    if (isColumnKind(value)) setSelectedKind(value)
  }

  const handleConfirm = () => {
    if (!conversion) return
    updateCollection((current) => ({
      ...current,
      data: conversion.data,
      schema: current.schema.map((item) =>
        item.key === column.key ? { key: column.key, kind: selectedKind } : item
      ),
    }))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="ml-1.5 cursor-pointer text-xs font-normal text-muted-foreground hover:underline"
        title="Change type"
      >
        {column.kind}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Change type of "${column.key}"`}</DialogTitle>
          <DialogDescription>
            Choose the kind of value this column holds.
          </DialogDescription>
        </DialogHeader>
        <Select value={selectedKind} onValueChange={handleKindChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columnKinds.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {kind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!conversion || conversion.invalid === 0 ? (
          <p className="text-sm text-muted-foreground">
            All {total} values convert cleanly.
          </p>
        ) : (
          <p className="text-sm text-destructive">
            {conversion.invalid} of {total} values won't fit {selectedKind} and
            will show as invalid. They're kept as-is, so you can switch back.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={selectedKind === column.kind}
            onClick={handleConfirm}
          >
            Change type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ColumnKindPicker
