import { describe, expect, it } from "vitest";
import { normalizeIpAddress } from "../src/index.ts";

describe("normalizeIpAddress", () => {
  it("spells each address one way, however the layer that saw it wrote it", () => {
    expect(normalizeIpAddress("0000:0000:0000:0000:0000:0000:0000:0001")).toBe("::1");
    expect(normalizeIpAddress("::1")).toBe("::1");
    expect(normalizeIpAddress("2001:0DB8:0000:0000:0000:0000:0000:0042")).toBe("2001:db8::42");
    expect(normalizeIpAddress("::ffff:203.0.113.9")).toBe("203.0.113.9");
    expect(normalizeIpAddress(" 203.0.113.9 ")).toBe("203.0.113.9");
  });

  it("records nothing for a missing or blank address", () => {
    expect(normalizeIpAddress(null)).toBeNull();
    expect(normalizeIpAddress("  ")).toBeNull();
  });
});
