export type SensitiveDataKind = "email" | "mobile" | "national_id";

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    return String(persianIndex >= 0 ? persianIndex : arabicDigits.indexOf(digit));
  });
}

function validIranianNationalId(value: string) {
  if (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value)) return false;
  const check = Number(value[9]);
  const sum = value
    .slice(0, 9)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return check === (remainder < 2 ? remainder : 11 - remainder);
}

export function detectSensitivePersonalData(content: string): SensitiveDataKind[] {
  const normalized = normalizeDigits(content);
  const findings = new Set<SensitiveDataKind>();
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized)) findings.add("email");
  if (/(?:^|\D)(?:\+98|0098|0)?9\d{9}(?!\d)/.test(normalized)) findings.add("mobile");
  for (const match of normalized.matchAll(/(?:^|\D)(\d{10})(?!\d)/g)) {
    if (validIranianNationalId(match[1])) findings.add("national_id");
  }
  return [...findings];
}
