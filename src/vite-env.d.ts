/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** localStorage key prefix; defaults to "json-db". */
  readonly VITE_STORAGE_NAMESPACE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
