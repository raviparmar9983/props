// `js-cookie` ships without its own type declarations, and this app does not
// depend on `@types/js-cookie` (kept out to avoid adding a new dependency).
// This ambient shim is intentionally loose — it only covers the handful of
// calls used in lib/api/client.ts.
declare module "js-cookie" {
  interface CookieAttributes {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    [key: string]: unknown;
  }

  interface CookiesStatic {
    get(name: string): string | undefined;
    get(): Record<string, string>;
    set(name: string, value: string, options?: CookieAttributes): void;
    remove(name: string, options?: CookieAttributes): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}
