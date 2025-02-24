import { CollectionData } from "../atoms/jsonAtom"
import DataTableCell from "./DataTableCell"

const DataTable = ({ data }: { data: CollectionData }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-red-500">No data available</p>
  }

  // Collect all unique keys from all objects
  const allKeys = Array.from(new Set(data.flatMap(Object.keys)))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 shadow-md rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            {allKeys.map((key) => (
              <th
                key={key}
                className="px-4 py-2 border border-gray-300 text-left"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-gray-100">
              {allKeys.map((key) => (
                <DataTableCell key={key} row={row} dataKey={key} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
