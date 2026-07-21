import crypto from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChars(length: number): string {
  return Array.from({ length }, () => alphabet[crypto.randomInt(alphabet.length)]).join("");
}

export function createPublicCode(date = new Date()): string {
  const year = new Intl.DateTimeFormat("fa-IR-u-nu-latn", { year: "numeric" }).format(date);
  return `DP-${year}-${randomChars(6)}`;
}

export function createClaimToken(): string {
  return crypto.randomBytes(12).toString("base64url");
}

export function createActivationCode(): string {
  return `LAW-${randomChars(4)}-${randomChars(4)}`;
}

export function hashActivationCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}
