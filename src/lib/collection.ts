import type { Collection, Relation, RelationIdentifier } from "../atoms/jsonAtom"
import { err, ok, type ColumnKind, type Result, type Row } from "./schema"

/** The next row id: max + 1 when every id is an integer, else a random UUID. */
export const nextId = (rows: readonly Row[]): string => {
  if (!rows.every((row) => /^\d+$/.test(row.id))) return crypto.randomUUID()
  return String(Math.max(0, ...rows.map((row) => Number(row.id))) + 1)
}

/** Append an empty row; its other cells are missing. */
export const addRow = (collection: Collection): Collection => ({
  ...collection,
  data: [...collection.data, { id: nextId(collection.data) }],
})

export const deleteRow = (collection: Collection, id: string): Collection => ({
  ...collection,
  data: collection.data.filter((row) => row.id !== id),
})

const hasColumn = (collection: Collection, key: string): boolean =>
  collection.schema.some((column) => column.key === key)

/** Why `name` can't be a new column key, if it can't. `id` is reserved. */
const keyError = (collection: Collection, name: string): string | undefined => {
  if (name === "") return "Enter a column name."
  if (name === "id") return `"id" is reserved for the row id.`
  if (hasColumn(collection, name)) return `"${name}" already exists.`
}

/** Append a column; existing rows get no value for it. */
export const addColumn = (
  collection: Collection,
  key: string,
  kind: ColumnKind
): Result<Collection> => {
  const name = key.trim()
  const error = keyError(collection, name)
  if (error) return err(error)
  return ok({ ...collection, schema: [...collection.schema, { key: name, kind }] })
}

/** Move a row's value from key `from` to key `to`; rows without it are kept. */
const renameCell = (row: Row, from: string, to: string): Row => {
  if (!(from in row)) return row
  const { [from]: value, ...rest } = row
  return { ...rest, id: row.id, [to]: value }
}

/** Rename a column in the schema and in every row. The `id` column is fixed. */
export const renameColumn = (
  collection: Collection,
  from: string,
  to: string
): Result<Collection> => {
  const name = to.trim()
  if (from === "id") return err("The id column can't be renamed.")
  if (name === from) return ok(collection)
  const error = keyError(collection, name)
  if (error) return err(error)
  return ok({
    ...collection,
    schema: collection.schema.map((column) =>
      column.key === from ? { ...column, key: name } : column
    ),
    data: collection.data.map((row) => renameCell(row, from, name)),
  })
}

/** Point relations that use `collection`'s column `from` at its new name `to`. */
export const renameInRelations = (
  relations: readonly Relation[],
  collection: string,
  from: string,
  to: string
): Relation[] => {
  const rename = (target: RelationIdentifier): RelationIdentifier =>
    target.collection === collection && target.key === from
      ? { ...target, key: to }
      : target
  return relations.map((relation) => ({
    ...relation,
    element: rename(relation.element),
    refersTo: rename(relation.refersTo),
  }))
}
