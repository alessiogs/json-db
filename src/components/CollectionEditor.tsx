import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { Collection, collectionsAtom } from "../atoms/jsonAtom"
import DataTable from "./DataTable"

const CollectionEditor = () => {
  const [searchParams] = useSearchParams()
  const [collections] = useAtom(collectionsAtom)
  const [collection, setCollection] = useState<Collection | null>(null)

  useEffect(() => {
    const index = searchParams.get("collection")
    if (index !== null) {
      const selectedCollection = collections[parseInt(index)]
      if (selectedCollection) {
        return setCollection(selectedCollection)
      }
    } else {
      return setCollection(null)
    }
  }, [searchParams, collections])
  return (
    <main className="w-full h-screen overflow-auto">
      {collection ? (
        <section>
          <h2 className="text-lg font-semibold capitalize mb-4">
            {collection?.name}
          </h2>

          <DataTable data={collection?.data} />
        </section>
      ) : (
        <div className="flex flex-1 justify-center items-center">
          Please, select a collection
        </div>
      )}
    </main>
  )
}

export default CollectionEditor
