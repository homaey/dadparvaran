import { describe, expect, it } from "vitest";
import {
  lawyerPrivateMessage,
  openGroupMessage,
  userAssignedMessage,
  userHandoffKeyboard,
} from "../message-templates";

const baseCard = {
  publicCode: "DP-1405-ABC123",
  claimToken: "tok",
  category: "خانواده",
  city: "اهواز",
  caseStage: "پیش از طرح دعوا",
  urgency: "عادی",
  createdAt: new Date("2026-07-22T08:00:00Z"),
};

describe("openGroupMessage", () => {
  it("never leaks the client's name or phone before the request is claimed", () => {
    const text = openGroupMessage(baseCard);
    expect(text).not.toMatch(/تلفن|09\d{9}/);
    expect(text).toContain("DP-1405-ABC123");
  });

  it("tells lawyers a web-form request needs a phone call", () => {
    const text = openGroupMessage({ ...baseCard, source: "WEB_FORM" });
    expect(text).toContain("تماس تلفنی");
    expect(text).toContain("متقاضی در بله نیست");
  });

  it("tells lawyers a mini-app request continues in Bale chat", () => {
    const text = openGroupMessage({ ...baseCard, source: "BALE_MINIAPP" });
    expect(text).toContain("چت در بله");
  });
});

const baseHandoff = {
  publicCode: "DP-1405-ABC123",
  clientName: "محمد رضایی",
  phone: "09123456789",
  category: "خانواده",
  city: "اهواز",
  caseStage: "پیش از طرح دعوا",
  urgency: "عادی",
  summary: "شرح موضوع",
};

describe("lawyerPrivateMessage", () => {
  it("warns the lawyer that a web-form client received no notification", () => {
    const text = lawyerPrivateMessage({ ...baseHandoff, source: "WEB_FORM" });
    expect(text).toContain("حساب بله ندارد");
    expect(text).toContain("09123456789");
  });

  it("omits the warning for a Bale client, who gets their own message", () => {
    const text = lawyerPrivateMessage({ ...baseHandoff, source: "BALE_MINIAPP" });
    expect(text).not.toContain("حساب بله ندارد");
  });

  it("skips optional lines that were not supplied", () => {
    const text = lawyerPrivateMessage({ ...baseHandoff, phone: null });
    expect(text).not.toContain("تلفن:");
    expect(text).not.toContain("ایمیل:");
  });
});

describe("userHandoffKeyboard", () => {
  // ارسال دکمه با url خالی از سمت بله رد می‌شود و کل پیام واگذاری شکست می‌خورد.
  it("drops the chat button when the lawyer has no public Bale URL", () => {
    const keyboard = userHandoffKeyboard({ publicCode: "DP-1", lawyerChatUrl: "" });
    expect(keyboard.inline_keyboard).toHaveLength(1);
    expect(JSON.stringify(keyboard)).not.toContain('"url"');
  });

  it("includes the chat button when a URL exists", () => {
    const keyboard = userHandoffKeyboard({
      publicCode: "DP-1",
      lawyerChatUrl: "https://ble.ir/somelawyer",
    });
    expect(keyboard.inline_keyboard).toHaveLength(2);
    expect(keyboard.inline_keyboard[0][0].url).toBe("https://ble.ir/somelawyer");
  });
});

describe("userAssignedMessage", () => {
  it("tells the client to wait for a call when no chat link will be shown", () => {
    const text = userAssignedMessage({ publicCode: "DP-1", lawyerName: "الف", hasChatUrl: false });
    expect(text).toContain("تماس می‌گیرد");
    expect(text).not.toContain("دکمه زیر");
  });

  it("points at the chat button when one exists", () => {
    const text = userAssignedMessage({ publicCode: "DP-1", lawyerName: "الف", hasChatUrl: true });
    expect(text).toContain("دکمه زیر");
  });
});
