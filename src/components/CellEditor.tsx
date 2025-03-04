import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"

type CellEditorProps = {
  value: string | number | boolean
  setValue: React.Dispatch<React.SetStateAction<string | number | boolean>>
  onSave: (value: string | number | boolean) => void
}
const CellEditor = ({ value, setValue, onSave }: CellEditorProps) => {
  const dataType = typeof value
  let inputType = "text"
  switch (dataType) {
    case "number":
      inputType = "number"
      break
    case "boolean":
      inputType = "checkbox"
      break
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSave(value)
    }
  }

  if (typeof value === "boolean")
    return (
      <Checkbox
        checked={value as boolean}
        onCheckedChange={() => setValue((prev) => !prev)}
      />
    )
  return (
    <Input
      className="w-full"
      type={inputType}
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

export default CellEditor
