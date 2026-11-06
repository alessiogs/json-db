import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type CustomSelectProps = {
  id?: string
  options: readonly string[]
  value: string
  setValue: (value: string) => void
  placeholder: string
}

/** A select over plain string options; an empty value shows the placeholder. */
const CustomSelect = ({
  id,
  options,
  value,
  setValue,
  placeholder,
}: CustomSelectProps) => (
  <Select value={value} onValueChange={setValue} disabled={options.length === 0}>
    <SelectTrigger id={id} className="w-full">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent position="popper">
      <SelectGroup>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)

export default CustomSelect
