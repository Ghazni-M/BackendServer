/// <reference types="node" />

// Basic image declarations (if you really need them in backend)
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

// Optional: Environment variables typing (very useful)
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    
    // Email
    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_SECURE?: string;
    EMAIL_USER?: string;
    EMAIL_APP_PASSWORD?: string;
    EMAIL_FROM?: string;

    // Add other env vars you use (JWT secret, database URL, etc.)
    JWT_SECRET?: string;
    DATABASE_URL?: string;
  }
}