import { atom } from "jotai"

export type Collection = {
  name: string
  data: CollectionData
}

export type CollectionData = {
  id: string
  [key: string]: string | number | boolean | string[] | number[] | boolean[]
}[]

export const collectionsAtom = atom<Collection[]>([
  {
    name: "authors",
    data: [
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
    ],
  },
  {
    name: "books",
    data: [
      {
        id: "1",
        title: "The Great Gatsby",
        authorId: "1",
        genreId: "4",
        publication_year: 1925,
      },
      {
        id: "2",
        title: "To Kill a Mockingbird",
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
    ],
  },
  {
    name: "genres",
    data: [
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
    ],
  },
])
