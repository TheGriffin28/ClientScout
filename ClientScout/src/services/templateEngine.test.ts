import { describe, it, expect } from "vitest";
import { getTheme, suggestLayoutFor } from "./templateEngine";

describe("templateEngine", () => {
  it("suggests the startup theme for marketing businesses", () => {
    const suggestion = suggestLayoutFor("marketing", "agency");

    expect(suggestion.templateKey).toBe("premium-dark");
    expect(suggestion.themeKey).toBe("startup");
    expect(suggestion.heroVariant).toBe("large-visual");
  });

  it("falls back to corporate/light when the industry is unknown", () => {
    const suggestion = suggestLayoutFor("unknown industry", "unknown");

    expect(suggestion.templateKey).toBe("modern-business");
    expect(suggestion.themeKey).toBe("light");
    expect(suggestion.heroVariant).toBe("left-image");
  });

  it("returns the correct luxury theme colors", () => {
    const theme = getTheme("luxury");

    expect(theme.colors.primary).toBe("#0b0b0b");
    expect(theme.colors.accent).toBe("#d4af37");
  });
});
