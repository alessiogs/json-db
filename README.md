# json-db

A small in-browser database editor: collections of JSON rows with typed columns and relations. When you're done, export the data as a `db.json` (ready for [json-server](https://github.com/typicode/json-server)) together with matching TypeScript types.

**Live:** https://alessiogs.github.io/json-db/

## The example library

A first visit opens a small library. It is seeded in `src/atoms/jsonAtom.ts` and is built to show every feature:

| Collection | Columns | References |
| --- | --- | --- |
| `authors` | name, born, nationality | — |
| `genres` | name | — |
| `books` | title, published, available, tags (`string[]`), ratings (`number[]`) | `authorId` → authors.name, `genreId` → genres.name |
| `members` | name, email, joined | — |
| `loans` | returned | `bookId` → books.title, `memberId` → members.name |

Things to try:

- **References.** Open `books`: `authorId` shows `2 George Orwell`. Click the cell to pick another author; only existing authors are offered.
- **Broken references.** Delete George Orwell from `authors`. In `books`, his ids turn red, and hovering one explains why.
- **Column types.** Click a column's type (e.g. `published  number`) to convert it. The dialog previews how many values would become invalid. Invalid cells stay in red until you fix them.
- **Import.** Use *Add Collection* with [`examples/reviews.json`](examples/reviews.json). Then add relations `reviews.bookId` → `books.id` (alias `title`) and `reviews.memberId` → `members.id` (alias `name`). Review 4 points at book 9, which doesn't exist, so it shows up as a broken reference.
- **Export.** *Export db.json* and *Export types* in the sidebar footer.

Everything is saved in `localStorage`, so to get the example back, clear the site's data.

## Development

```sh
npm install
npm run dev     # http://localhost:5173/json-db/
npm run build
```

Pushes to `main` build and deploy to GitHub Pages (`.github/workflows/main.yml`). Pull requests into `main` and `develop` get a build check.

## How the types fit together

- `src/lib/schema.ts`: a column's `kind` (`"number"`, `"string[]"`, …) is the single source of truth. `ValueOf<K>` derives the TypeScript type from it, and `codecFor(kind)` returns a typed parser and formatter.
- `src/lib/reference.ts`: resolves references. `referenceOptions<K>` parses each referenced key with the referencing column's codec, so the picker can only return a value of that column's type.
- `src/lib/storage.ts`: `validatedStorage<T>(validate)` checks what comes back from `localStorage` before the app sees it.
