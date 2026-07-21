import crypto, { type BinaryLike } from "node:crypto";

export interface ValidatedBaleMiniAppUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  allowsWriteToPm?: boolean;
  authDate: number;
  queryId?: string;
}

interface RawBaleUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  allows_write_to_pm?: boolean;
}

function safeHexEqual(a: string, b: string): boolean {
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b) || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function hmacHex(data: string, key: BinaryLike): string {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export function validateBaleMiniAppInitData(input: {
  initData: string;
  botToken: string;
  maxAgeSeconds?: number;
  nowSeconds?: number;
  hmacMode?: "docs" | "telegram" | "compatible";
}): ValidatedBaleMiniAppUser {
  const params = new URLSearchParams(input.initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) throw new Error("BALE_INIT_DATA_HASH_MISSING");

  const entries = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join("\n");

  // Bale's prose and pseudocode do not explicitly state the argument order of
  // HMAC_SHA256. `docs` follows key=bot_token,data=WebAppData; `telegram`
  // follows the Telegram-compatible key=WebAppData,data=bot_token convention.
  // Both candidates require possession of the bot token. After confirming the
  // exact production signature, BALE_MINIAPP_HMAC_MODE can be locked down.
  const docsSecret = crypto.createHmac("sha256", input.botToken).update("WebAppData").digest();
  const telegramSecret = crypto.createHmac("sha256", "WebAppData").update(input.botToken).digest();
  const expectedDocs = hmacHex(dataCheckString, docsSecret);
  const expectedTelegram = hmacHex(dataCheckString, telegramSecret);
  const mode = input.hmacMode ?? "compatible";
  const valid =
    (mode !== "telegram" && safeHexEqual(receivedHash, expectedDocs)) ||
    (mode !== "docs" && safeHexEqual(receivedHash, expectedTelegram));
  if (!valid) throw new Error("BALE_INIT_DATA_INVALID_SIGNATURE");

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? Number(authDateRaw) : NaN;
  if (!Number.isInteger(authDate)) throw new Error("BALE_INIT_DATA_AUTH_DATE_INVALID");

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAge = input.maxAgeSeconds ?? 600;
  if (authDate > now + 60 || now - authDate > maxAge) {
    throw new Error("BALE_INIT_DATA_EXPIRED");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("BALE_INIT_DATA_USER_MISSING");

  let user: RawBaleUser;
  try {
    user = JSON.parse(userRaw) as RawBaleUser;
  } catch {
    throw new Error("BALE_INIT_DATA_USER_INVALID");
  }

  if (user.id === undefined || !user.first_name) throw new Error("BALE_INIT_DATA_USER_INVALID");

  return {
    id: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    allowsWriteToPm: user.allows_write_to_pm,
    authDate,
    queryId: params.get("query_id") ?? undefined,
  };
}
