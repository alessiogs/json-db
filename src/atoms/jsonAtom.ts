import { atom } from "jotai"
import { inferSchema, type Row, type Schema } from "../lib/schema"

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

export const collectionsAtom = atom<Collection[]>([
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
])

export type RelationIdentifier = {
  collection: string
  key: string
}

export type Relation = {
  element: RelationIdentifier
  refersTo: RelationIdentifier
  alias: string
}

export const relationsAtom = atom<Relation[]>([])

/** A relation being edited: same shape, but fields may still be empty. */
export const emptyRelation: Relation = {
  element: { collection: "", key: "" },
  refersTo: { collection: "", key: "" },
  alias: "",
}

export const isCompleteRelation = ({ element, refersTo, alias }: Relation) =>
  [element.collection, element.key, refersTo.collection, refersTo.key, alias]
    .every(Boolean)
