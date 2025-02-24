import { useAtom } from "jotai"
import { useSearchParams } from "react-router"
import { collectionsAtom } from "../atoms/jsonAtom"

const Sidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const onSelect = (index: string) => {
    setSearchParams((prev) => {
      prev.set("collection", index)
      return prev
    })
  }
  const [collections] = useAtom(collectionsAtom)

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Collections</h2>
      <ul>
        {collections.map((collection, index) => (
          <li
            key={index}
            className={`p-2 my-1 cursor-pointer hover:bg-gray-700 ${
              searchParams.get("collection") === index.toString() &&
              "bg-gray-600 font-semibold"
            } rounded transition-all duration-200`}
            onClick={() => onSelect(index.toString())}
          >
            {collection.name}
          </li>
        ))}
        {collections.length === 0 && (
          <p className="text-gray-400">No collections found.</p>
        )}
        <div className="mt-4"></div>
      </ul>
    </aside>
  )
}

export default Sidebar
