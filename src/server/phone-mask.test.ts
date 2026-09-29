import { describe, expect, it } from "vitest";
import { maskPhone } from "./phone-mask";

describe("maskPhone", () => {
  it("masks all but the last 4 digits of a 10-digit number", () => {
    expect(maskPhone("9876543210")).toBe("******3210");
  });

  it("masks E.164 numbers including the country code", () => {
    expect(maskPhone("+919876543210")).toBe("********3210");
  });

  it("never leaks the +91 prefix", () => {
    const masked = maskPhone("+919876543210");
    expect(masked).not.toContain("+");
    expect(masked).not.toContain("91");
  });

  it("masks very short inputs entirely", () => {
    expect(maskPhone("1234")).toBe("****");
    expect(maskPhone("5")).toBe("*");
    expect(maskPhone("")).toBe("");
  });
});
