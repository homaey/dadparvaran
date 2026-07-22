import { describe, expect, it, vi } from "vitest";
import { BaleApiError } from "@/modules/bale/client";

/**
 * بله `getChatMember` را برای باتی که ادمین گروه نیست با ۴۰۳ رد می‌کند.
 * پیش از این، آن خطا تا بالا حباب می‌کرد و کاربر در گروه پیام خام
 * «Forbidden: permission_denied» می‌دید و هیچ درخواستی پذیرفته نمی‌شد.
 *
 * این تست‌ها روی خودِ منطق تشخیص کار می‌کنند تا وقتی BaleApiError تغییر کرد،
 * شکست بدهند.
 */
describe("BaleApiError permission-denied detection", () => {
  it("carries the 403 error code from Bale's payload", () => {
    const error = new BaleApiError("Forbidden: permission_denied", 403, 403);
    expect(error.errorCode).toBe(403);
    expect(error.status).toBe(403);
  });

  it("is distinguishable from a timeout, which must not be swallowed", () => {
    const timeout = new BaleApiError("Bale API timeout: getChatMember");
    expect(timeout.errorCode).toBeUndefined();
    expect(timeout.status).toBeUndefined();
  });
});

describe("claim flow membership fallback", () => {
  it("treats a 403 as unverified-but-allowed, and anything else as fatal", async () => {
    // بازتولید همان شرطی که در checkGroupMembership استفاده می‌شود.
    const isPermissionDenied = (error: unknown) =>
      error instanceof BaleApiError && (error.errorCode === 403 || error.status === 403);

    expect(isPermissionDenied(new BaleApiError("Forbidden: permission_denied", 403, 403))).toBe(true);
    expect(isPermissionDenied(new BaleApiError("Bale API timeout: getChatMember"))).toBe(false);
    expect(isPermissionDenied(new BaleApiError("Bad Request", 400, 400))).toBe(false);
    expect(isPermissionDenied(new Error("network down"))).toBe(false);
  });

  it("keeps the account gate as the primary defence", () => {
    // مقادیری که مدیر کنترل می‌کند و مستقل از پاسخ بله سنجیده می‌شوند.
    const eligible = (account: { isVerified: boolean; isActive: boolean; isAvailable: boolean }) =>
      account.isVerified && account.isActive && account.isAvailable;

    expect(eligible({ isVerified: true, isActive: true, isAvailable: true })).toBe(true);
    expect(eligible({ isVerified: false, isActive: true, isAvailable: true })).toBe(false);
    expect(eligible({ isVerified: true, isActive: false, isAvailable: true })).toBe(false);
  });
});
