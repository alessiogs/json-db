import { useAtom } from "jotai"
import { collectionsAtom } from "../atoms/jsonAtom"
import { useSelectedCollectionName } from "../hooks/useSelectedCollection"
import DataTable from "./DataTable"

const CollectionEditor = () => {
  const [collections] = useAtom(collectionsAtom)
  const collectionName = useSelectedCollectionName()
  const collection =
    collections.find((current) => current.name === collectionName) ?? null

  return (
    <main className="w-full h-screen overflow-auto">
      {collection ? (
        <section>
          <h2 className="text-lg font-semibold capitalize mb-4">
            {collection?.name}
          </h2>

          <DataTable collection={collection} />
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
