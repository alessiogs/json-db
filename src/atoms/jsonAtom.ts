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

/*
 * The example a first visit starts with: a small library. It uses every
 * column kind, and its relations (below) make books and loans reference
 * other collections, so the table shows e.g. an author's name beside its id.
 */
const seedCollections: Collection[] = [
  makeCollection("authors", [
    { id: "1", name: "F. Scott Fitzgerald", born: 1896, nationality: "American" },
    { id: "2", name: "George Orwell", born: 1903, nationality: "British" },
    { id: "3", name: "Jane Austen", born: 1775, nationality: "British" },
    { id: "4", name: "J. R. R. Tolkien", born: 1892, nationality: "British" },
    { id: "5", name: "Harper Lee", born: 1926, nationality: "American" },
    { id: "6", name: "Gabriel García Márquez", born: 1927, nationality: "Colombian" },
  ]),
  makeCollection("genres", [
    { id: "1", name: "Classic" },
    { id: "2", name: "Dystopian" },
    { id: "3", name: "Romance" },
    { id: "4", name: "Fantasy" },
    { id: "5", name: "Magical realism" },
  ]),
  makeCollection("books", [
    {
      id: "1",
      title: "The Great Gatsby",
      authorId: "1",
      genreId: "1",
      published: 1925,
      available: true,
      tags: ["jazz age", "new york"],
      ratings: [5, 4, 4],
    },
    {
      id: "2",
      title: "Nineteen Eighty-Four",
      authorId: "2",
      genreId: "2",
      published: 1949,
      available: false,
      tags: ["surveillance", "totalitarianism"],
      ratings: [5, 5, 4],
    },
    {
      id: "3",
      title: "Animal Farm",
      authorId: "2",
      genreId: "2",
      published: 1945,
      available: true,
      tags: ["allegory", "satire"],
      ratings: [4, 5],
    },
    {
      id: "4",
      title: "Pride and Prejudice",
      authorId: "3",
      genreId: "3",
      published: 1813,
      available: true,
      tags: ["marriage", "class"],
      ratings: [5, 4, 5],
    },
    {
      id: "5",
      title: "Emma",
      authorId: "3",
      genreId: "3",
      published: 1815,
      available: false,
      tags: ["matchmaking"],
      ratings: [4],
    },
    {
      id: "6",
      title: "The Hobbit",
      authorId: "4",
      genreId: "4",
      published: 1937,
      available: true,
      tags: ["adventure", "dragons"],
      ratings: [5, 5],
    },
    {
      id: "7",
      title: "To Kill a Mockingbird",
      authorId: "5",
      genreId: "1",
      published: 1960,
      available: true,
      tags: ["justice", "childhood"],
      ratings: [5, 4],
    },
    {
      id: "8",
      title: "One Hundred Years of Solitude",
      authorId: "6",
      genreId: "5",
      published: 1967,
      available: false,
      tags: ["family saga", "macondo"],
      ratings: [5, 3, 4],
    },
  ]),
  makeCollection("members", [
    { id: "1", name: "Giulia Rossi", email: "giulia@example.com", joined: 2021 },
    { id: "2", name: "Marco Bianchi", email: "marco@example.com", joined: 2023 },
    { id: "3", name: "Sara Conti", email: "sara@example.com", joined: 2024 },
  ]),
  makeCollection("loans", [
    { id: "1", bookId: "2", memberId: "1", returned: false },
    { id: "2", bookId: "5", memberId: "2", returned: false },
    { id: "3", bookId: "8", memberId: "3", returned: false },
    { id: "4", bookId: "1", memberId: "1", returned: true },
  ]),
]

const reference = (
  collection: string,
  key: string,
  refersTo: string,
  alias: string
): Relation => ({
  element: { collection, key },
  refersTo: { collection: refersTo, key: "id" },
  alias,
})

const seedRelations: Relation[] = [
  reference("books", "authorId", "authors", "name"),
  reference("books", "genreId", "genres", "name"),
  reference("loans", "bookId", "books", "title"),
  reference("loans", "memberId", "members", "name"),
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
  seedRelations,
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
