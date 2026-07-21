declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      API_PORT?: string;
      DATABASE_URL?: string;
      CORS_ORIGIN?: string;
      JWT_SECRET?: string;
      HETZNER_OBJECT_STORAGE_ACCESS_KEY?: string;
      HETZNER_OBJECT_STORAGE_SECRET_KEY?: string;
      HETZNER_OBJECT_STORAGE_BUCKET?: string;
      HETZNER_OBJECT_STORAGE_REGION?: string;
      HETZNER_OBJECT_STORAGE_ENDPOINT?: string;
      HETZNER_OBJECT_STORAGE_PREFIX?: string;
    }
  }
}

export {};
