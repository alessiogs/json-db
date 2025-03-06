import { SelectValue } from "@radix-ui/react-select"
import { Select, SelectContent, SelectGroup, SelectTrigger } from "./ui/select"

type CustomSelectProps = {
  children: React.ReactNode
  value: string
  setValue: (value: string) => void
  defaultValue: string
  placeholder: string
}
const CustomSelect = ({
  children,
  value,
  setValue,
  defaultValue,
  placeholder,
}: CustomSelectProps) => {
  return (
    <Select value={value} onValueChange={setValue} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default CustomSelect
