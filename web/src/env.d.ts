declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SITE_TITLE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
