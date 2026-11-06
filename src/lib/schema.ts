/**
 * Column typing for collections.
 *
 * A column's `kind` is a string literal ("number", "string[]", ...). Everything
 * else (the TypeScript type of its values, how to parse and format them, how to
 * validate them) is derived from that literal, so adding a kind means adding
 * one entry to `ScalarTypes` and one codec.
 */

/* ---------- Kinds and the value types they map to ---------- */

type ScalarTypes = {
  string: string
  number: number
  boolean: boolean
}

export type ScalarKind = keyof ScalarTypes

/** "string" | "number" | "boolean" | "string[]" | "number[]" | "boolean[]" */
export type ColumnKind = ScalarKind | `${ScalarKind}[]`

/** The TypeScript type of a value stored in a column of kind `K`. */
export type ValueOf<K extends ColumnKind> = K extends ScalarKind
  ? ScalarTypes[K]
  : K extends `${infer S extends ScalarKind}[]`
    ? ScalarTypes[S][]
    : never

/** Any value a cell can hold: the union of `ValueOf` over every kind. */
export type CellValue = ValueOf<ColumnKind>

export type Row = { id: string; [key: string]: CellValue }

/** A column whose kind is known to be `K`. Generic code takes this shape. */
export type ColumnDef<K extends ColumnKind> = { key: string; kind: K }

/**
 * A column of any kind, as a discriminated union on `kind`:
 * `{ key; kind: "string" } | { key; kind: "number" } | ...`
 * so checking `column.kind` narrows it.
 */
export type Column = { [K in ColumnKind]: ColumnDef<K> }[ColumnKind]

export type Schema = Column[]

/* ---------- Results ---------- */

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const err = <T = never>(error: string): Result<T> => ({ ok: false, error })

/* ---------- Codecs: parse, format and validate values of one kind ---------- */

export type Codec<T> = {
  /** Turn user input into a value, or explain why it can't be. */
  parse: (raw: string) => Result<T>
  /** Turn a value into editable text; `parse(format(v))` gives back `v`. */
  format: (value: T) => string
  /** Check that an unknown value belongs to this kind. */
  is: (value: unknown) => value is T
}

/** Narrow a kind to a single-value one: not an array. */
export const isScalarKind = (kind: ColumnKind): kind is ScalarKind =>
  !kind.endsWith("[]")

const scalarCodecs: { [K in ScalarKind]: Codec<ScalarTypes[K]> } = {
  string: {
    parse: (raw) => ok(raw),
    format: (value) => value,
    is: (value) => typeof value === "string",
  },
  number: {
    parse: (raw) => {
      const text = raw.trim()
      if (text === "") return err("Enter a number.")
      const value = Number(text)
      return Number.isFinite(value) ? ok(value) : err(`"${text}" isn't a number.`)
    },
    format: (value) => String(value),
    is: (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  },
  boolean: {
    parse: (raw) => {
      const text = raw.trim().toLowerCase()
      if (text === "true") return ok(true)
      if (text === "false") return ok(false)
      return err('Use "true" or "false".')
    },
    format: (value) => String(value),
    is: (value) => typeof value === "boolean",
  },
}

/**
 * Lift a codec for `T` to a codec for `T[]`, edited as comma-separated text.
 * (Items that themselves contain commas aren't supported yet.)
 */
const arrayOf = <T>(item: Codec<T>): Codec<T[]> => ({
  parse: (raw) => {
    if (raw.trim() === "") return ok([])
    const values: T[] = []
    for (const [index, part] of raw.split(",").entries()) {
      const result = item.parse(part.trim())
      if (!result.ok) return err(`Item ${index + 1}: ${result.error}`)
      values.push(result.value)
    }
    return ok(values)
  },
  format: (values) => values.map(item.format).join(", "),
  is: (value): value is T[] => Array.isArray(value) && value.every(item.is),
})

/** One codec per kind; the mapped type guarantees each matches `ValueOf<K>`. */
const codecs: { [K in ColumnKind]: Codec<ValueOf<K>> } = {
  ...scalarCodecs,
  "string[]": arrayOf(scalarCodecs.string),
  "number[]": arrayOf(scalarCodecs.number),
  "boolean[]": arrayOf(scalarCodecs.boolean),
}

export const columnKinds = Object.keys(codecs) as ColumnKind[]

export const codecFor = <K extends ColumnKind>(kind: K): Codec<ValueOf<K>> =>
  codecs[kind]

/* ---------- Reading cells ---------- */

export type Cell<K extends ColumnKind> =
  | { status: "missing" }
  | { status: "valid"; value: ValueOf<K> }
  /** The row holds a value that doesn't match the column's kind. */
  | { status: "invalid"; raw: CellValue }

export const readCell = <K extends ColumnKind>(
  row: Row,
  column: ColumnDef<K>
): Cell<K> => {
  const raw = row[column.key]
  if (raw === undefined) return { status: "missing" }
  return codecFor(column.kind).is(raw)
    ? { status: "valid", value: raw }
    : { status: "invalid", raw }
}

/* ---------- Converting between kinds ---------- */

/**
 * Compose two codecs into a conversion: show a value as `from` would, then
 * read that text back as `to`. E.g. number → string[] turns 3 into ["3"].
 */
export const convert =
  <A, B>(from: Codec<A>, to: Codec<B>) =>
  (value: A): Result<B> =>
    to.parse(from.format(value))

/** Text for a value that doesn't match its column, so it can be re-read. */
const textOf = (raw: CellValue): string =>
  Array.isArray(raw) ? raw.join(", ") : String(raw)

/** The rows after re-typing a column, and how many cells didn't fit. */
export type ColumnConversion = { data: Row[]; invalid: number }

/**
 * Change a column's kind: valid values go through `convert`, invalid ones are
 * re-read from their text, missing ones stay missing. A value that doesn't fit
 * the new kind is left untouched (it shows up as an invalid cell), so
 * converting back recovers it.
 */
export const convertColumn = <K extends ColumnKind, L extends ColumnKind>(
  rows: readonly Row[],
  column: ColumnDef<K>,
  kind: L
): ColumnConversion => {
  const to = codecFor(kind)
  const retype = convert(codecFor(column.kind), to)

  let invalid = 0
  const data = rows.map((row): Row => {
    const cell = readCell(row, column)
    if (cell.status === "missing") return row

    const result =
      cell.status === "valid" ? retype(cell.value) : to.parse(textOf(cell.raw))
    if (!result.ok) {
      invalid++
      return row
    }
    return { ...row, [column.key]: result.value }
  })
  return { data, invalid }
}

/* ---------- Inferring a schema from data ---------- */

const scalarKindOf = (value: unknown): ScalarKind | undefined => {
  const type = typeof value
  return type === "string" || type === "number" || type === "boolean"
    ? type
    : undefined
}

/** The kind of a single value, or `undefined` if it has none (e.g. `[]`). */
export const kindOf = (value: unknown): ColumnKind | undefined => {
  if (!Array.isArray(value)) return scalarKindOf(value)
  const kind = scalarKindOf(value[0])
  return kind && value.every((item) => scalarKindOf(item) === kind)
    ? `${kind}[]`
    : undefined
}

/**
 * One column per key, in first-seen order with `id` first. Each column takes
 * the kind most of its values have, so a few stray values show up as invalid
 * cells instead of changing the column. Ties and keys with no typed values
 * fall back to "string" (or "string[]" if every value is an array).
 */
export const inferSchema = (rows: readonly Row[]): Schema => {
  type Tally = { counts: Map<ColumnKind, number>; onlyArrays: boolean }
  const seen = new Map<string, Tally>()

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      const tally = seen.get(key) ?? { counts: new Map(), onlyArrays: true }
      const kind = kindOf(value)
      if (kind) tally.counts.set(kind, (tally.counts.get(kind) ?? 0) + 1)
      tally.onlyArrays &&= Array.isArray(value)
      seen.set(key, tally)
    }
  }

  const columns = [...seen].map(([key, { counts, onlyArrays }]): Column => {
    const ranked = [...counts].sort(([, a], [, b]) => b - a)
    const [first, second] = ranked
    if (first && (!second || first[1] > second[1])) {
      return { key, kind: first[0] }
    }
    return { key, kind: onlyArrays ? "string[]" : "string" }
  })

  return columns.sort((a, b) => Number(b.key === "id") - Number(a.key === "id"))
}

/* ---------- Importing rows from JSON ---------- */

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isCellValue = (value: unknown): value is CellValue =>
  kindOf(value) !== undefined || (Array.isArray(value) && value.length === 0)

/**
 * Check that `value` is an array of plain objects and validate each one,
 * stopping at the first error. `label` names items in messages ("Item 2 …").
 */
export const validateObjects = <T>(
  value: unknown,
  label: string,
  validateItem: (item: Record<string, unknown>, where: string) => Result<T>
): Result<T[]> => {
  if (!Array.isArray(value)) return err("Expected an array of objects.")
  const items: unknown[] = value

  const valid: T[] = []
  for (const [index, item] of items.entries()) {
    const where = `${label} ${index + 1}`
    if (!isPlainObject(item)) return err(`${where} isn't an object.`)
    const result = validateItem(item, where)
    if (!result.ok) return result
    valid.push(result.value)
  }
  return ok(valid)
}

/**
 * Check rows: objects with a string or number `id`, whose other values are
 * cells. `null` values are treated as missing.
 */
export const validateRows = (value: unknown): Result<Row[]> =>
  validateObjects(value, "Item", ({ id, ...rest }, where) => {
    if (typeof id !== "string" && typeof id !== "number") {
      return err(`${where} needs a string or number "id".`)
    }

    const row: Row = { id: String(id) }
    for (const [key, cell] of Object.entries(rest)) {
      if (cell === null) continue
      if (!isCellValue(cell)) {
        return err(
          `${where}, "${key}": nested objects and mixed arrays aren't supported yet.`
        )
      }
      row[key] = cell
    }
    return ok(row)
  })

/** Parse a JSON file into rows (see `validateRows`). */
export const parseRows = (json: string): Result<Row[]> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return err("The file isn't valid JSON.")
  }
  return validateRows(parsed)
}

/* ---------- Validating a stored schema ---------- */

export const isColumnKind = (value: unknown): value is ColumnKind =>
  columnKinds.some((kind) => kind === value)

/** Check a schema: `{ key, kind }` columns with a known kind. */
export const validateSchema = (value: unknown): Result<Schema> =>
  validateObjects(value, "Column", ({ key, kind }, where): Result<Column> => {
    if (typeof key !== "string") return err(`${where} needs a string "key".`)
    if (!isColumnKind(kind)) return err(`${where} has an unknown kind.`)
    return ok({ key, kind })
  })
