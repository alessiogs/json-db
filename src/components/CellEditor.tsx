import { useState, type FormEvent } from "react"
import { codecFor, type ColumnKind, type ValueOf } from "../lib/schema"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"

type CellEditorProps<K extends ColumnKind> = {
  kind: K
  initial: ValueOf<K> | undefined
  onSave: (value: ValueOf<K>) => void
}

/**
 * Edits one value of kind `K`. The draft is always text; the column's codec
 * parses it, so `onSave` only ever receives a value of the right type.
 */
const CellEditor = <K extends ColumnKind>({
  kind,
  initial,
  onSave,
}: CellEditorProps<K>) => {
  const codec = codecFor(kind)
  const [draft, setDraft] = useState(() =>
    initial === undefined ? (kind === "boolean" ? "false" : "") : codec.format(initial)
  )
  const result = codec.parse(draft)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (result.ok) onSave(result.value)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {kind === "boolean" ? (
        <label className="flex items-center gap-2">
          <Checkbox
            checked={draft === "true"}
            onCheckedChange={(checked) => setDraft(String(checked === true))}
          />
          {draft}
        </label>
      ) : (
        <Input
          autoFocus
          className="w-full"
          inputMode={kind === "number" ? "decimal" : undefined}
          placeholder={kind.endsWith("[]") ? "Comma-separated values" : undefined}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={!result.ok}
        />
      )}
      {!result.ok && <p className="text-sm text-destructive">{result.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={!result.ok}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

export default CellEditor
