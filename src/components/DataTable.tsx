import { Plus, Trash2 } from "lucide-react"
import type { Collection } from "../atoms/jsonAtom"
import { useUpdateCollection } from "../hooks/useUpdateCollection"
import { addRow, deleteRow } from "../lib/collection"
import AddColumnDialog from "./AddColumnDialog"
import ColumnKindPicker from "./ColumnKindPicker"
import DataTableCell from "./DataTableCell"
import RenameColumnDialog from "./RenameColumnDialog"
import { Button } from "./ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

const DataTable = ({ collection }: { collection: Collection }) => {
  const { schema, data } = collection
  const updateCollection = useUpdateCollection(collection.name)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {schema.map((column) => (
              <TableHead key={column.key}>
                {/* id is fixed: always a string, never renamed. */}
                {column.key === "id" ? (
                  <>
                    {column.key}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {column.kind}
                    </span>
                  </>
                ) : (
                  <>
                    <RenameColumnDialog
                      collection={collection}
                      columnKey={column.key}
                    />
                    <ColumnKindPicker collection={collection} column={column} />
                  </>
                )}
              </TableHead>
            ))}
            <TableHead className="w-0">
              <AddColumnDialog collection={collection} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={schema.length + 1}
                className="text-muted-foreground"
              >
                No rows yet.
              </TableCell>
            </TableRow>
          )}
          {data.map((row) => (
            <TableRow key={row.id}>
              {schema.map((column) => (
                <DataTableCell key={column.key} row={row} column={column} />
              ))}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete row"
                  onClick={() =>
                    updateCollection((current) => deleteRow(current, row.id))
                  }
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => updateCollection(addRow)}
      >
        <Plus />
        Add row
      </Button>
    </div>
  )
}

export default DataTable
