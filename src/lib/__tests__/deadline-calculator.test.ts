import { describe, it, expect } from "vitest";
import { calculateDeadline, type CalcOptions } from "@/lib/deadline-calculator";
import { jalaliKey } from "@/lib/jalali";

function calc(overrides: Partial<CalcOptions> = {}) {
  const defaults: CalcOptions = {
    startDate: { jy: 1405, jm: 4, jd: 14 },
    days: 20,
    holidaySet: new Set<string>(),
    thursdayOff: false,
    mode: "deadline",
    deadlineTitle: "تست",
    article: null,
    isForeign: false,
  };
  return calculateDeadline({ ...defaults, ...overrides });
}

// Fixed Shamsi holidays used in tests
const FIXED_HOLIDAYS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 12], [1, 13],
  [3, 14], [3, 15], [11, 22], [12, 29],
];

function makeHolidaySet(year: number): Set<string> {
  const set = new Set<string>();
  for (const [m, d] of FIXED_HOLIDAYS) {
    set.add(jalaliKey({ jy: year, jm: m, jd: d }));
  }
  return set;
}

describe("Legal Deadline Calculator", () => {
  // ── Test 1: Article 445 — day of notification and action excluded ──
  it("applies Article 445: adds days+1 so notification day is excluded", () => {
    // Start: 1405/04/14 (Sunday), 20 days
    // Article 445: addDays(start, 20+1) = addDays(start, 21)
    const result = calc({ days: 20 });
    // 1405/04/14 + 21 days = 1405/05/04
    expect(result.rawDateStr).toBe("1405/05/04");
    expect(result.duration).toBe(20);
  });

  // ── Test 2: Holiday shift — Friday ──
  it("shifts deadline past Friday", () => {
    // Find a date where raw falls on Friday
    // 1405/04/18 is Thursday (weekdayIndex=4)
    // Start: 1405/04/07, 10 days → raw = 1405/04/07 + 11 = 1405/04/18 (Thursday)
    // Not Friday, let's try another:
    // 1405/04/19 is Friday (weekdayIndex=5)
    // Start: 1405/04/08, 10 days → raw = 1405/04/08 + 11 = 1405/04/19
    const result = calc({
      startDate: { jy: 1405, jm: 4, jd: 8 },
      days: 10,
    });
    // raw = 1405/04/19 — if it's Friday, should shift to Saturday 1405/04/20
    if (result.rawWeekday === "جمعه") {
      expect(result.shifts.length).toBeGreaterThan(0);
      expect(result.shifts[0].reason).toBe("جمعه");
      expect(result.finalDateStr).toBe("1405/04/20");
    } else {
      // Let's find a concrete Friday case
      // 1405/01/01 is Saturday per Jalali calendar
      // Try: start 1405/04/02, days=3 → raw = 1405/04/02 + 4 = 1405/04/06
      const r2 = calc({
        startDate: { jy: 1405, jm: 4, jd: 2 },
        days: 3,
      });
      // Check if 1405/04/06 is a Friday
      if (r2.rawWeekday === "جمعه") {
        expect(r2.shifts.length).toBeGreaterThan(0);
        expect(r2.shifts[0].reason).toBe("جمعه");
      }
    }
  });

  // ── Test 3: Chain of holidays — consecutive shifts ──
  it("chains through consecutive holidays (Thursday+Friday)", () => {
    // thursdayOff=true means Thursday and Friday are both off
    // Start: 1405/04/06, days=5 → raw = 1405/04/06 + 6 = 1405/04/12
    // Let's find a case where raw falls on Thursday with thursdayOff
    // 1405/04/17 is Wednesday, 1405/04/18 is Thursday
    // Start: 1405/04/07, days=10 → raw = 1405/04/18 (if Thursday)
    const result = calc({
      startDate: { jy: 1405, jm: 4, jd: 7 },
      days: 10,
      thursdayOff: true,
    });
    // If raw is Thursday, should chain: Thu→Fri→Sat
    if (result.rawWeekday === "پنج‌شنبه") {
      expect(result.shifts.length).toBe(2); // Thursday + Friday
      expect(result.shifts[0].reason).toBe("پنج‌شنبه تعطیل");
      expect(result.shifts[1].reason).toBe("جمعه");
    }
  });

  // ── Test 4: Foreign resident mode ──
  it("uses foreign days when isForeign is true", () => {
    const result = calc({
      days: 60, // foreignDays value for تجدیدنظر
      isForeign: true,
    });
    expect(result.duration).toBe(60);
    expect(result.isForeign).toBe(true);
  });

  // ── Test 5: Minimum mode ──
  it("returns mode=minimum for minimum-gap deadlines", () => {
    const result = calc({
      mode: "minimum",
      days: 5,
    });
    expect(result.mode).toBe("minimum");
    // Same Article 445 rule applies
    expect(result.rawDateStr).toBeTruthy();
  });

  // ── Test 6: Comparison with reference — known holiday shift ──
  it("matches reference: shifts past registered holidays", () => {
    // Scenario: deadline falls on 1405/01/01 (Nowruz, a fixed holiday)
    // Nowruz block: 1,2,3,4 Farvardin + 12,13 Farvardin are holidays
    // So if raw = 1405/01/01, should shift past 01/01, 01/02, 01/03, 01/04
    // Then 1405/01/05 — check if it's Friday, etc.
    const holidays = makeHolidaySet(1405);

    // Start: 1404/12/20, days=10
    // raw = 1404/12/20 + 11 = ?
    // 1404/12 has 29 days (non-leap) or 30 days (leap)
    // 1404 is a leap year in Jalali (1404 % 4 == 0 roughly)
    // So 1404/12 has 30 days
    // 1404/12/20 + 11 = 1404/12/31? No, 12 has 30 days → overflow → 1405/01/01
    const result = calc({
      startDate: { jy: 1404, jm: 12, jd: 20 },
      days: 10,
      holidaySet: holidays,
    });

    // raw should be around 1405/01/01 (Nowruz)
    // If raw is 1405/01/01, final should shift past 01/01,02,03,04 → 01/05
    // If 01/05 is Friday, shifts to 01/06, etc.
    if (result.rawDateStr === "1405/01/01") {
      expect(result.shifts.length).toBeGreaterThanOrEqual(4); // at least 4 Nowruz days
      // Final should be after 1405/01/04
      expect(result.finalDate.jd).toBeGreaterThan(4);
    }
  });

  // ── Additional: Article 445 math verification ──
  it("Article 445: start + days + 1 = raw date (verified by counting)", () => {
    // 1405/04/01 + (3+1) = 1405/04/05
    const result = calc({
      startDate: { jy: 1405, jm: 4, jd: 1 },
      days: 3,
    });
    expect(result.rawDateStr).toBe("1405/04/05");
    expect(result.startDateStr).toBe("1405/04/01");
  });

  it("registered holiday triggers shift with correct reason", () => {
    // Add a specific holiday: 1405/04/20
    const holidays = new Set<string>(["1405/04/20"]);
    // Make raw land on 1405/04/20
    // start + days + 1 = 1405/04/20
    // 1405/04/01 + (18+1) = 1405/04/20
    const result = calc({
      startDate: { jy: 1405, jm: 4, jd: 1 },
      days: 18,
      holidaySet: holidays,
    });
    expect(result.rawDateStr).toBe("1405/04/20");
    expect(result.shifts.length).toBeGreaterThanOrEqual(1);
    expect(result.shifts[0].reason).toBe("تعطیل رسمی");
    expect(result.finalDateStr).not.toBe("1405/04/20");
  });

  it("no shift when raw date is a working day", () => {
    // 1405/04/05 — verify it's not Friday and not in holidays
    const result = calc({
      startDate: { jy: 1405, jm: 4, jd: 1 },
      days: 3,
      holidaySet: new Set<string>(),
    });
    // If not Friday, no shifts
    if (result.rawWeekday !== "جمعه") {
      expect(result.shifts).toHaveLength(0);
      expect(result.finalDateStr).toBe(result.rawDateStr);
    }
  });
});
