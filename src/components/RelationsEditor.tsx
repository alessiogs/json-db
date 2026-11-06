import { useAtom } from "jotai"
import { collectionsAtom, type Relation } from "../atoms/jsonAtom"
import CustomSelect from "./CustomSelect"
import { SelectItem } from "./ui/select"

type RelationsEditorProps = {
  formData: Relation
  setFormData: (draft: Relation) => void
}

const RelationsEditor = ({ formData, setFormData }: RelationsEditorProps) => {
  const [collections] = useAtom(collectionsAtom)
  const allKeys = collections.map((collection) => ({
    collection: collection.name,
    keys: collection.schema.map((column) => column.key),
  }))

  const handleChange = (
    value: string,
    side: "element" | "refersTo",
    level: "collection" | "key"
  ) => {
    // A relation can't point at its own collection: picking the target's
    // collection as the element clears the target.
    if (
      side === "element" &&
      level === "collection" &&
      value === formData.refersTo.collection
    ) {
      setFormData({
        ...formData,
        element: { collection: value, key: "" },
        refersTo: { collection: "", key: "" },
      })
      return
    }
    setFormData({
      ...formData,
      [side]: {
        ...formData[side],
        [level]: value,
      },
    })
  }

  return (
    <section>
      <div className="flex gap-4">
        <label>Element</label>
        <CustomSelect
          value={formData.element.collection}
          setValue={(value) => handleChange(value, "element", "collection")}
          defaultValue={formData.element.collection}
          placeholder="Select collection"
        >
          {allKeys.map((collection, index) => (
            <SelectItem key={index} value={collection.collection}>
              {collection.collection}
            </SelectItem>
          ))}
        </CustomSelect>
        <CustomSelect
          value={formData.element.key}
          setValue={(value) => handleChange(value, "element", "key")}
          defaultValue={formData.element.key}
          placeholder="Select key"
        >
          {allKeys
            .find(
              (collection) =>
                collection.collection === formData.element.collection
            )
            ?.keys.map((key, index) => (
              <SelectItem key={index} value={key}>
                {key}
              </SelectItem>
            ))}
        </CustomSelect>
      </div>
      <label>Refers to</label>
      <CustomSelect
        value={formData.refersTo.collection}
        setValue={(value) => handleChange(value, "refersTo", "collection")}
        defaultValue={formData.refersTo.collection}
        placeholder="Select collection"
      >
        {allKeys.map(
          (collection, index) =>
            collection.collection !== formData.element.collection && (
              <SelectItem key={index} value={collection.collection}>
                {collection.collection}
              </SelectItem>
            )
        )}
      </CustomSelect>
      <CustomSelect
        value={formData.refersTo.key}
        setValue={(value) => handleChange(value, "refersTo", "key")}
        defaultValue={formData.refersTo.key}
        placeholder="Select key"
      >
        {allKeys
          .find(
            (collection) =>
              collection.collection === formData.refersTo.collection
          )
          ?.keys.map((key, index) => (
            <SelectItem key={index} value={key}>
              {key}
            </SelectItem>
          ))}
      </CustomSelect>
      Use
      {
        <CustomSelect
          value={formData.alias}
          setValue={(value) => setFormData({ ...formData, alias: value })}
          defaultValue={formData.refersTo.key}
          placeholder="Select key"
        >
          {allKeys
            .find(
              (collection) =>
                collection.collection === formData.refersTo.collection
            )
            ?.keys.map((key, index) => (
              <SelectItem key={index} value={key}>
                {key}
              </SelectItem>
            ))}
        </CustomSelect>
      }
      in place of {formData.element.key}
    </section>
  )
}

export default RelationsEditor
