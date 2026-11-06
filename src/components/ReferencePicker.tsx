import { useState, type FormEvent } from "react"
import type { ReferenceOption } from "../lib/reference"
import type { CellValue } from "../lib/schema"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type ReferencePickerProps<T extends CellValue> = {
  options: ReferenceOption<T>[]
  initial: T | undefined
  onSave: (value: T) => void
}

/** Edits a reference by picking one of the rows it can point at. */
const ReferencePicker = <T extends CellValue>({
  options,
  initial,
  onSave,
}: ReferencePickerProps<T>) => {
  // The select works on text; each option's text maps back to its value.
  const [text, setText] = useState(
    () => options.find((option) => option.value === initial)?.text ?? ""
  )
  const selected = options.find((option) => option.text === text)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selected) onSave(selected.value)
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        There are no rows to point at yet.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <Select value={text} onValueChange={setText}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pick a row" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.text} value={option.text}>
              {option.text}
              <span className="text-muted-foreground">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex justify-end">
        <Button type="submit" disabled={!selected}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

export default ReferencePicker
