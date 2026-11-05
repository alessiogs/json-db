import { useSetAtom } from "jotai"
import { useCallback } from "react"
import { collectionsAtom, type Collection } from "../atoms/jsonAtom"

/**
 * Returns a function that applies `update` to the collection called `name`.
 * With `null` (nothing selected) no collection matches, so it does nothing.
 */
export const useUpdateCollection = (name: string | null) => {
  const setCollections = useSetAtom(collectionsAtom)
  return useCallback(
    (update: (collection: Collection) => Collection): void =>
      setCollections((prev) =>
        prev.map((current) => (current.name === name ? update(current) : current))
      ),
    [setCollections, name]
  )
}
