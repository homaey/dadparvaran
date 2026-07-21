export type BaleCallbackAction =
  | { kind: "claim"; token: string }
  | {
      kind: "status";
      token: string;
      action: "contacted" | "no_answer" | "return_admin" | "not_fit" | "close";
    };

const tokenPattern = /^[A-Za-z0-9_-]{8,32}$/;

export function parseBaleCallbackData(data: string | undefined): BaleCallbackAction | null {
  if (!data || Buffer.byteLength(data, "utf8") > 64) return null;
  const parts = data.split(":");

  if (parts.length === 2 && parts[0] === "claim" && tokenPattern.test(parts[1])) {
    return { kind: "claim", token: parts[1] };
  }

  const actions = new Set(["contacted", "no_answer", "return_admin", "not_fit", "close"]);
  if (
    parts.length === 3 &&
    parts[0] === "status" &&
    tokenPattern.test(parts[1]) &&
    actions.has(parts[2])
  ) {
    return {
      kind: "status",
      token: parts[1],
      action: parts[2] as Extract<BaleCallbackAction, { kind: "status" }>['action'],
    };
  }

  return null;
}
