import { useSearchParams } from "react-router"

/** Name of the collection selected via the `?collection=` search param. */
export const useSelectedCollectionName = (): string | null => {
  const [searchParams] = useSearchParams()
  return searchParams.get("collection")
}
