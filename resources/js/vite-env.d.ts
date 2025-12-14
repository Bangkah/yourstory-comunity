/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: (pattern: string) => Record<string, () => Promise<any>>
}
