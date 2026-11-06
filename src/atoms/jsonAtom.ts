import { atomWithStorage } from "jotai/utils"
import {
  err,
  inferSchema,
  isPlainObject,
  ok,
  validateObjects,
  validateRows,
  validateSchema,
  type Result,
  type Row,
  type Schema,
} from "../lib/schema"
import { validatedStorage } from "../lib/storage"

export type Collection = {
  name: string
  schema: Schema
  data: Row[]
}

export type CollectionData = Row[]

/** Build a collection, inferring its schema from the data. */
export const makeCollection = (name: string, data: Row[]): Collection => ({
  name,
  data,
  schema: inferSchema(data),
})

const seedCollections: Collection[] = [
  makeCollection("authors", [
    {
      id: "1",
      name: "John Doe",
      age: 30,
      is_active: true,
      skills: ["JavaScript", "React"],
    },
    {
      id: "2",
      name: "Jane Doe",
      age: 25,
      is_active: false,
      skills: ["Python", "Django"],
    },
    {
      id: "3",
      name: "Bob Smith",
      age: 40,
      is_active: true,
      skills: ["Java", "Spring"],
    },
    {
      id: "4",
      name: "Alice Johnson",
      age: 35,
      is_active: false,
      skills: ["PHP", "Laravel"],
    },
  ]),
  makeCollection("books", [
    {
      id: "1",
      title: "The Great Gatsby",
      authorId: "1",
      genreId: "4",
      publication_year: 1925,
    },
    {
      id: "2",
      title: "Book 2",
      authorId: "2",
      genreId: "3",
      publication_year: 1960,
    },
    {
      id: "3",
      title: "1984",
      authorId: "3",
      genreId: "1",
      publication_year: 1949,
    },
    {
      id: "4",
      title: "Pride and Prejudice",
      authorId: "4",
      genreId: "2",
      publication_year: 1813,
    },
    {
      id: "5",
      title: "The Catcher in the Rye",
      authorId: "1",
      genreId: "4",
      publication_year: 1951,
    },
    {
      id: "6",
      title: "The Lord of the Rings",
      authorId: "3",
      genreId: "1",
      publication_year: 1954,
    },
  ]),
  makeCollection("genres", [
    {
      id: "1",
      name: "Fiction",
    },
    {
      id: "2",
      name: "Non-Fiction",
    },
    {
      id: "3",
      name: "Drama",
    },
    {
      id: "4",
      name: "Romance",
    },
  ]),
]

/**
 * Check stored collections. A bad schema is re-inferred from the data rather
 * than rejecting everything, since it can always be derived again.
 */
export const validateCollections = (value: unknown): Result<Collection[]> => {
  const names = new Set<string>()
  return validateObjects(value, "Collection", ({ name, data, schema }, where) => {
    if (typeof name !== "string") return err(`${where} needs a string "name".`)
    if (names.has(name)) return err(`${where}: duplicate name "${name}".`)
    names.add(name)

    const rows = validateRows(data)
    if (!rows.ok) return err(`${where}: ${rows.error}`)

    const checked = validateSchema(schema)
    return ok({
      name,
      data: rows.value,
      schema: checked.ok ? checked.value : inferSchema(rows.value),
    })
  })
}

export const collectionsAtom = atomWithStorage(
  "json-db:collections",
  seedCollections,
  validatedStorage(validateCollections),
  { getOnInit: true }
)

export type RelationIdentifier = {
  collection: string
  key: string
}

export type Relation = {
  element: RelationIdentifier
  refersTo: RelationIdentifier
  alias: string
}

const validateIdentifier = (value: unknown): Result<RelationIdentifier> => {
  if (!isPlainObject(value)) return err("isn't an object.")
  const { collection, key } = value
  if (typeof collection !== "string" || typeof key !== "string") {
    return err("needs a string collection and key.")
  }
  return ok({ collection, key })
}

/** Check stored relations. */
export const validateRelations = (value: unknown): Result<Relation[]> =>
  validateObjects(value, "Relation", (item, where) => {
    const element = validateIdentifier(item.element)
    if (!element.ok) return err(`${where}, element: ${element.error}`)
    const refersTo = validateIdentifier(item.refersTo)
    if (!refersTo.ok) return err(`${where}, refersTo: ${refersTo.error}`)
    if (typeof item.alias !== "string") {
      return err(`${where} needs a string "alias".`)
    }
    return ok({ element: element.value, refersTo: refersTo.value, alias: item.alias })
  })

export const relationsAtom = atomWithStorage<Relation[]>(
  "json-db:relations",
  [],
  validatedStorage(validateRelations),
  { getOnInit: true }
)

/** A relation being edited: same shape, but fields may still be empty. */
export const emptyRelation: Relation = {
  element: { collection: "", key: "" },
  refersTo: { collection: "", key: "" },
  alias: "",
}

export const isCompleteRelation = ({ element, refersTo, alias }: Relation) =>
  [element.collection, element.key, refersTo.collection, refersTo.key, alias]
    .every(Boolean)
