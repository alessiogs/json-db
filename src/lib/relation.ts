import type { Collection, Relation } from "../atoms/jsonAtom"
import { isScalarKind } from "./schema"

/** "books.authorId → authors.name": what a relation reads as in a list. */
export const describeRelation = ({ element, refersTo, alias }: Relation) =>
  `${element.collection}.${element.key} → ${refersTo.collection}.${alias}`

const sameColumn = (a: Relation, b: Relation) =>
  a.element.collection === b.element.collection && a.element.key === b.element.key

/**
 * Columns of `collection` that can hold a reference: scalar, not the row id,
 * and not already used by another relation (`editing` is the one being edited).
 */
export const referenceColumns = (
  collection: Collection | undefined,
  relations: readonly Relation[],
  editing?: Relation
): string[] =>
  (collection?.schema ?? [])
    .filter((column) => column.key !== "id" && isScalarKind(column.kind))
    .map((column) => column.key)
    .filter(
      (key) =>
        !relations.some(
          (relation) =>
            relation !== editing &&
            relation.element.collection === collection?.name &&
            relation.element.key === key
        )
    )

/** Why `draft` can't be saved, if it can't. */
export const relationError = (
  collections: readonly Collection[],
  relations: readonly Relation[],
  draft: Relation,
  editing?: Relation
): string | undefined => {
  const { element, refersTo, alias } = draft
  if (!element.collection || !element.key) return "Pick the referencing column."
  if (!refersTo.collection || !refersTo.key) return "Pick the column it points at."
  if (!alias) return "Pick the column to show."
  if (element.collection === refersTo.collection) {
    return "A relation can't point at its own collection."
  }
  const target = collections.find((item) => item.name === refersTo.collection)
  const has = (key: string) => target?.schema.some((column) => column.key === key)
  if (!has(refersTo.key) || !has(alias)) {
    return `"${refersTo.collection}" doesn't have those columns.`
  }
  if (relations.some((relation) => relation !== editing && sameColumn(relation, draft))) {
    return `${element.collection}.${element.key} already has a relation.`
  }
}

/** Drop relations that start from or point at `collection`. */
export const removeCollectionRelations = (
  relations: readonly Relation[],
  collection: string
): Relation[] =>
  relations.filter(
    ({ element, refersTo }) =>
      element.collection !== collection && refersTo.collection !== collection
  )
