import { atomWithStorage } from "jotai/utils"
import { Collection, Relation } from "./jsonAtom"

export type DbSession = {
  name: string
  collections: Collection[]
  relations: Relation[]
}

export const sessionsAtom = atomWithStorage<DbSession[]>("sessions", [])
