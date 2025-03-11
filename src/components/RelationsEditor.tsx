import { useAtom, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { collectionsAtom, relationsAtom } from "../atoms/jsonAtom"
import CustomSelect from "./CustomSelect"
import { Button } from "./ui/button"
import { SelectItem } from "./ui/select"

const RelationsEditor = () => {
  const [collections] = useAtom(collectionsAtom)
  const setRelations = useSetAtom(relationsAtom)
  const allKeys = collections.map((collection) => ({
    collection: collection.name,
    keys: Array.from(new Set(collection.data.flatMap(Object.keys))),
  }))
  const [formData, setFormData] = useState({
    element: { collection: "", key: "" },
    refersTo: { collection: "", key: "" },
    alias: "",
  })

  useEffect(() => {
    if (formData.element.collection === formData.refersTo.collection) {
      setFormData({
        ...formData,
        element: { ...formData.element, key: "" },
        refersTo: { collection: "", key: "" },
      })
    }
  }, [formData.element.collection])

  const handleCreateRelation = () => {
    if (
      !formData.alias &&
      !formData.element.collection &&
      !formData.element.key &&
      !formData.refersTo.collection &&
      !formData.refersTo.key
    ) {
      return
    }

    setRelations((prev) => [...prev, formData])
  }

  const handleChange = (
    value: string,
    side: "element" | "refersTo",
    level: "collection" | "key"
  ) => {
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
      <div className="text-right">
        <Button variant="outline" onClick={handleCreateRelation}>
          Create Relation
        </Button>
      </div>
    </section>
  )
}

export default RelationsEditor
