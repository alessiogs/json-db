import { CollectionData } from "../atoms/jsonAtom"
import DataTableCell from "./DataTableCell"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table"

const DataTable = ({ data }: { data: CollectionData }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-red-500">No data available</p>
  }

  // Collect all unique keys from all objects
  const allKeys = Array.from(new Set(data.flatMap(Object.keys)))

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {allKeys.map((key) => (
              <TableHead key={key}>{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {allKeys.map((key) => (
                <DataTableCell key={key} row={row} dataKey={key} />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
