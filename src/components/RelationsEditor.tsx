import { useAtomValue } from "jotai"
import { collectionsAtom, relationsAtom, type Relation } from "../atoms/jsonAtom"
import { referenceColumns } from "../lib/relation"
import CustomSelect from "./CustomSelect"

type RelationsEditorProps = {
  formData: Relation
  setFormData: (draft: Relation) => void
  /** The stored relation being edited, so its own column stays pickable. */
  editing?: Relation
}

const RelationsEditor = ({ formData, setFormData, editing }: RelationsEditorProps) => {
  const collections = useAtomValue(collectionsAtom)
  const relations = useAtomValue(relationsAtom)
  const { element, refersTo, alias } = formData

  const names = collections.map((collection) => collection.name)
  const byName = (name: string) => collections.find((item) => item.name === name)
  const target = byName(refersTo.collection)
  const targetKeys = target?.schema.map((column) => column.key) ?? []

  // Changing a collection clears the fields that depend on it, so the draft
  // never keeps a key from a collection that is no longer picked.
  const setElementCollection = (collection: string) =>
    setFormData({
      ...formData,
      element: { collection, key: "" },
      ...(collection === refersTo.collection && {
        refersTo: { collection: "", key: "" },
        alias: "",
      }),
    })

  const setTargetCollection = (collection: string) => {
    const keys = byName(collection)?.schema.map((column) => column.key) ?? []
    setFormData({
      ...formData,
      refersTo: { collection, key: keys.includes("id") ? "id" : "" },
      alias: "",
    })
  }

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Column</legend>
        <div className="grid grid-cols-2 gap-2">
          <CustomSelect
            options={names}
            value={element.collection}
            setValue={setElementCollection}
            placeholder="Collection"
          />
          <CustomSelect
            options={referenceColumns(byName(element.collection), relations, editing)}
            value={element.key}
            setValue={(key) =>
              setFormData({ ...formData, element: { ...element, key } })
            }
            placeholder="Column"
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Points at</legend>
        <div className="grid grid-cols-2 gap-2">
          <CustomSelect
            options={names.filter((name) => name !== element.collection)}
            value={refersTo.collection}
            setValue={setTargetCollection}
            placeholder="Collection"
          />
          <CustomSelect
            options={targetKeys}
            value={refersTo.key}
            setValue={(key) =>
              setFormData({ ...formData, refersTo: { ...refersTo, key } })
            }
            placeholder="Column"
          />
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="relation-alias" className="text-sm font-medium">
          Show
        </label>
        <CustomSelect
          id="relation-alias"
          options={targetKeys}
          value={alias}
          setValue={(value) => setFormData({ ...formData, alias: value })}
          placeholder="Column to show"
        />
        <p className="text-sm text-muted-foreground">
          {element.key && refersTo.collection && alias
            ? `Each ${element.key} shows the ${alias} of the ${refersTo.collection} row it points at.`
            : "The column shown beside each reference in the table."}
        </p>
      </div>
    </div>
  )
}

export default RelationsEditor
