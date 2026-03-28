// netlify.d.ts
declare module '@netlify/functions' {
  export type Handler = (event: any, context: any) => Promise<{
    statusCode: number;
    body: string;
    headers?: Record<string, string>;
  }>;

  export type HandlerEvent = any;
  export type HandlerContext = any;
}