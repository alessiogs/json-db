import type { Collection } from "../atoms/jsonAtom"
import DataTableCell from "./DataTableCell"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table"

const DataTable = ({ collection }: { collection: Collection }) => {
  const { schema, data } = collection

  if (data.length === 0) {
    return <p className="text-red-500">No data available</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {schema.map((column) => (
              <TableHead key={column.key}>
                {column.key}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {column.kind}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {schema.map((column) => (
                <DataTableCell key={column.key} row={row} column={column} />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
