import type { Collection, Relation } from "../atoms/jsonAtom"
import {
  codecFor,
  readCell,
  type CellValue,
  type Row,
  type ScalarKind,
  type ValueOf,
} from "./schema"

/** The relation that makes column `key` of `collection` a reference, if any. */
export const relationFrom = (
  relations: readonly Relation[],
  collection: string,
  key: string
): Relation | undefined =>
  relations.find(
    ({ element }) => element.collection === collection && element.key === key
  )

/** A cell as text through its column's codec; "-" without a valid value. */
const cellText = (collection: Collection, row: Row, key: string): string => {
  const column = collection.schema.find((item) => item.key === key)
  if (!column) return "-"
  const cell = readCell(row, column)
  return cell.status === "valid" ? codecFor(column.kind).format(cell.value) : "-"
}

/** Scalars compare as text, so a number column can point at string ids. */
const sameKey = (a: CellValue | undefined, b: CellValue): boolean =>
  a !== undefined && !Array.isArray(a) && !Array.isArray(b) && String(a) === String(b)

/** What a reference value points at. */
export type Reference =
  | { status: "found"; label: string }
  | { status: "dangling"; reason: string }

/** Find the row `value` points at and the text of its alias column. */
export const resolveReference = (
  collections: readonly Collection[],
  { refersTo, alias }: Relation,
  value: CellValue
): Reference => {
  const target = collections.find((item) => item.name === refersTo.collection)
  if (!target) {
    return { status: "dangling", reason: `"${refersTo.collection}" doesn't exist.` }
  }
  const row = target.data.find((item) => sameKey(item[refersTo.key], value))
  if (!row) {
    return {
      status: "dangling",
      reason: `No ${target.name} row has ${refersTo.key} ${String(value)}.`,
    }
  }
  return { status: "found", label: cellText(target, row, alias) }
}

/** A row a reference can point at: the value to store, and how to show it. */
export type ReferenceOption<T> = { value: T; text: string; label: string }

/**
 * Every row the relation can point at, its key parsed as `kind` so the value
 * fits the referencing column. Rows whose key doesn't fit are left out.
 */
export const referenceOptions = <K extends ScalarKind>(
  collections: readonly Collection[],
  { refersTo, alias }: Relation,
  kind: K
): ReferenceOption<ValueOf<K>>[] => {
  const target = collections.find((item) => item.name === refersTo.collection)
  if (!target) return []
  const codec = codecFor(kind)
  return target.data.flatMap((row) => {
    const key = row[refersTo.key]
    if (key === undefined || Array.isArray(key)) return []
    const parsed = codec.parse(String(key))
    if (!parsed.ok) return []
    return [
      {
        value: parsed.value,
        text: codec.format(parsed.value),
        label: cellText(target, row, alias),
      },
    ]
  })
}
