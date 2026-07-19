import { describe, expect, it } from "vitest";
import { serializeBlocksToDraft } from "./draft";

describe("structured article draft", () => {
  it("uses ordered article blocks as the canonical draft", () => {
    expect(serializeBlocksToDraft([
      { label: "نتیجه", content: "متن نتیجه", position: 2 },
      { label: "مقدمه", content: " متن مقدمه ", position: 1 },
    ])).toBe("مقدمه\nمتن مقدمه\n\nنتیجه\nمتن نتیجه");
  });
  it("omits empty blocks", () => expect(serializeBlocksToDraft([{ label: "خالی", content: "  " }])).toBe(""));
});
