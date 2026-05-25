import crypto from "crypto";

export function generateECPayCheckMac(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%7e/g, "~");

  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export function verifyECPayCheckMac(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string
): boolean {
  const checkMacValue = params["CheckMacValue"];
  if (!checkMacValue) return false;

  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "CheckMacValue") {
      filtered[k] = v;
    }
  }

  const computed = generateECPayCheckMac(filtered, hashKey, hashIV);
  return computed === checkMacValue;
}

export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomInt(1000, 9999);
  return `PAY${dateStr}${rand}`;
}
