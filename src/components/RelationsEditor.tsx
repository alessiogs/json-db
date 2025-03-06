import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { collectionsAtom, relationsAtom } from "../atoms/jsonAtom"
import CustomSelect from "./CustomSelect"
import { Button } from "./ui/button"
import { SelectItem } from "./ui/select"

const RelationsEditor = () => {
  const [collections] = useAtom(collectionsAtom)
  const [relations, setRelations] = useAtom(relationsAtom)
  const [showForm, setShowForm] = useState(false)
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

  useEffect(() => console.log(formData), [formData])

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
      <h1 className="text-lg font-semibold">Relations</h1>
      <div className="my-4">
        {relations.map((relation, index) => (
          <div key={index}>
            <p>
              {relation.element.key} in {relation.element.collection} refers to{" "}
              {relation.refersTo.key} in {relation.refersTo.collection} as{" "}
              {relation.alias}
            </p>
          </div>
        ))}
        {showForm && (
          <div className="flex- flex-col">
            <div className="flex flex-row justify-between">
              <div className="flex gap-4">
                <label>Element</label>
                <CustomSelect
                  value={formData.element.collection}
                  setValue={(value) =>
                    handleChange(value, "element", "collection")
                  }
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
              <div className="flex gap-4">
                <label>Refers to</label>
                <CustomSelect
                  value={formData.refersTo.collection}
                  setValue={(value) =>
                    handleChange(value, "refersTo", "collection")
                  }
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
              </div>
            </div>
            <div className="flex justify-center items-center">
              Use
              {
                <CustomSelect
                  value={formData.alias}
                  setValue={(value) =>
                    setFormData({ ...formData, alias: value })
                  }
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
            </div>

            <div className="text-right">
              <Button variant="outline" onClick={handleCreateRelation}>
                Create Relation
              </Button>
            </div>
          </div>
        )}
        {!showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            New Relation
          </Button>
        )}
      </div>
    </section>
  )
}

export default RelationsEditor
