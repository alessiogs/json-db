import type { atomWithStorage } from "jotai/utils"
import type { Result } from "./schema"

/**
 * jotai's synchronous storage. `jotai/utils` doesn't export the type, so take
 * it from `atomWithStorage`: its last overload is the synchronous one, and
 * `Parameters` of an overloaded function reads the last overload.
 */
type SyncStorage<T> = NonNullable<Parameters<typeof atomWithStorage<T>>[2]>

/**
 * localStorage as JSON, where every value read back is checked by `validate`.
 * Corrupt or outdated data is reported and replaced by the initial value
 * instead of reaching the app.
 */
export const validatedStorage = <T>(
  validate: (value: unknown) => Result<T>
): SyncStorage<T> => {
  const read = (key: string, initialValue: T): T => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return initialValue
      const result = validate(JSON.parse(stored))
      if (result.ok) return result.value
      console.warn(`Ignoring stored "${key}": ${result.error}`)
    } catch (error) {
      console.warn(`Couldn't read stored "${key}":`, error)
    }
    return initialValue
  }

  return {
    getItem: read,
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Private mode or a full quota: keep working in memory.
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Same as above: nothing to clean up.
      }
    },
    /** Keep other tabs in sync. */
    subscribe: (key, callback, initialValue) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) callback(read(key, initialValue))
      }
      window.addEventListener("storage", onStorage)
      return () => window.removeEventListener("storage", onStorage)
    },
  }
}
