import { describe, it, expect } from "vitest";
import { isValidRedirectDomain, sanitizeRedirectPath } from "./auth-domain";

describe("auth-domain logic (Business Logic Isolation)", () => {
  const allowed = ["example.com", "auth.company.io"];

  describe("isValidRedirectDomain", () => {
    it("allows exact domain matches", () => {
      expect(
        isValidRedirectDomain("https://example.com/dashboard", {
          allowedDomains: allowed,
        }),
      ).toBe(true);
    });

    it("allows authorized subdomains", () => {
      expect(
        isValidRedirectDomain("https://app.example.com/callback", {
          allowedDomains: allowed,
        }),
      ).toBe(true);
    });

    it("rejects unauthorized external domains", () => {
      expect(
        isValidRedirectDomain("https://malicious.com/phish", {
          allowedDomains: allowed,
        }),
      ).toBe(false);
    });

    it("rejects invalid URLs gracefully", () => {
      expect(
        isValidRedirectDomain("not-a-valid-url", { allowedDomains: allowed }),
      ).toBe(false);
    });
  });

  describe("sanitizeRedirectPath", () => {
    it("preserves valid relative paths", () => {
      expect(sanitizeRedirectPath("/settings/profile")).toBe(
        "/settings/profile",
      );
    });

    it("falls back to / on empty, protocol-relative, or invalid paths", () => {
      expect(sanitizeRedirectPath("")).toBe("/");
      expect(sanitizeRedirectPath("//attacker.com")).toBe("/");
      expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/");
    });
  });
});
