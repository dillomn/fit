// Single-password auth using an HMAC-signed cookie. Uses Web Crypto so the same
// verification runs in both the Node runtime and the edge middleware.

export const SESSION_COOKIE = "fit_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  return process.env.SESSION_SECRET || "insecure-dev-secret";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

/** Create a signed token of the form `<expiryMs>.<signature>`. */
export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = await hmac(String(exp));
  return `${exp}.${sig}`;
}

/** Verify a token's signature and expiry. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await hmac(exp);
  // Constant-time-ish compare.
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD || "changeme";
  if (password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
