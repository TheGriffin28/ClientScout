// Template + Theme model definitions for ClientScout
// Lightweight starter for Template Layer and Theme Layer

export type TemplateKey = "corporate" | "creative" | "minimal" | "ecommerce";
export type LegacyTemplateKey = "modern-business" | "premium-dark" | "local-bright" | "minimal-fast" | "ecommerce-store";

export type HeroVariant = "left-image" | "large-visual" | "centered";

export interface TemplateStructure {
  key: TemplateKey;
  name: string;
  description?: string;
  heroVariant: HeroVariant[]; // supported hero variants
  sectionsOrder: string[]; // canonical section order
  cardStyle: "grid" | "overlap" | "list";
  spacing: "dense" | "regular" | "spacious";
}

export type ThemeKey = "light" | "dark" | "luxury" | "startup" | "warm";

export interface ThemeTokens {
  key: ThemeKey;
  displayName: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  radii?: {
    soft: string;
    rounded: string;
  };
}

export const LEGACY_TEMPLATE_MAP: Record<TemplateKey, LegacyTemplateKey> = {
  corporate: "modern-business",
  creative: "premium-dark",
  minimal: "local-bright",
  ecommerce: "ecommerce-store",
};

export const TEMPLATES: Record<TemplateKey, TemplateStructure> = {
  corporate: {
    key: "corporate",
    name: "Corporate / Professional",
    description: "Left/right hero, stats, features, about, services, testimonials, gallery, CTA, contact",
    heroVariant: ["left-image", "centered"],
    sectionsOrder: ["hero", "stats", "features", "about", "services", "testimonials", "gallery", "cta", "contact", "footer"],
    cardStyle: "grid",
    spacing: "regular",
  },
  creative: {
    key: "creative",
    name: "Creative / Modern",
    description: "Large visual hero, stats, services, gallery, testimonials, quote, CTA, contact",
    heroVariant: ["large-visual", "centered"],
    sectionsOrder: ["hero", "stats", "services", "gallery", "testimonials", "quote", "cta", "contact", "footer"],
    cardStyle: "overlap",
    spacing: "spacious",
  },
  minimal: {
    key: "minimal",
    name: "Minimal / Local Business",
    description: "Centered hero, features, services, about, testimonials, CTA, contact",
    heroVariant: ["centered"],
    sectionsOrder: ["hero", "features", "services", "about", "testimonials", "cta", "contact", "footer"],
    cardStyle: "list",
    spacing: "dense",
  },
  ecommerce: {
    key: "ecommerce",
    name: "E-commerce / Store",
    description: "Hero with product spotlight, featured products, best sellers, testimonials, CTA, contact",
    heroVariant: ["left-image", "large-visual"],
    sectionsOrder: ["hero", "features", "services", "testimonials", "cta", "contact", "footer"],
    cardStyle: "grid",
    spacing: "spacious",
  },
};

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  light: {
    key: "light",
    displayName: "Light",
    colors: { primary: "#0f172a", accent: "#fb923c", background: "#ffffff", surface: "#f8fafc", text: "#0f172a" },
    fonts: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "12px", rounded: "8px" },
  },
  dark: {
    key: "dark",
    displayName: "Dark",
    colors: { primary: "#e2e8f0", accent: "#fb923c", background: "#0b1220", surface: "#0f1724", text: "#e2e8f0" },
    fonts: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "12px", rounded: "8px" },
  },
  luxury: {
    key: "luxury",
    displayName: "Luxury",
    colors: { primary: "#0b0b0b", accent: "#d4af37", background: "#050505", surface: "#0b0b0b", text: "#f7f3ea" },
    fonts: { heading: "Georgia, serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "16px", rounded: "10px" },
  },
  startup: {
    key: "startup",
    displayName: "Startup",
    colors: { primary: "#0f172a", accent: "#7c3aed", background: "#ffffff", surface: "#f8fafc", text: "#0f172a" },
    fonts: { heading: "Poppins, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "12px", rounded: "9999px" },
  },
  warm: {
    key: "warm",
    displayName: "Warm",
    colors: { primary: "#422006", accent: "#f97316", background: "#fff7ed", surface: "#fffaf0", text: "#422006" },
    fonts: { heading: "Merriweather, serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "12px", rounded: "8px" },
  },
};

export function getTemplate(key: TemplateKey) {
  return TEMPLATES[key];
}

export function getTheme(key: ThemeKey) {
  return THEMES[key];
}

export function getLegacyTemplateKey(key: TemplateKey): LegacyTemplateKey {
  return LEGACY_TEMPLATE_MAP[key];
}

export interface SuggestedLayout {
  templateKey: LegacyTemplateKey;
  themeKey: ThemeKey;
  heroVariant: HeroVariant;
}

export interface SuggestedLayoutWithRationale extends SuggestedLayout {
  rationale?: string;
}

export interface WebsiteObservations {
  performanceIssues?: string[];
  trustIssues?: string[];
  conversionIssues?: string[];
}

export interface DesignFix {
  category: string;
  issue: string;
  fix: string;
}

const industryRules: Array<{ match: RegExp; template: TemplateKey; theme: ThemeKey }> = [
  { match: /agency|creative|design|marketing|media|startup|software|technology|tech/i, template: "creative", theme: "startup" },
  { match: /education|training|academy|school|coaching|tutoring|learning/i, template: "corporate", theme: "warm" },
  { match: /restaurant|food|cafe|fitness|gym|salon|spa|wellness|local|retail|home services|services/i, template: "minimal", theme: "warm" },
  { match: /finance|legal|consulting|medical|health|real estate|insurance|construction/i, template: "corporate", theme: "dark" },
  { match: /fashion|luxury|jewelry|boutique|hotel|hospitality/i, template: "creative", theme: "luxury" },
];

function suggestFromIndustry(industry?: string, businessType?: string): SuggestedLayoutWithRationale {
  const normalized = `${industry || ""} ${businessType || ""}`.trim();
  const rule = industryRules.find((item) => item.match.test(normalized));
  const template: TemplateKey = rule?.template || "corporate";
  const theme: ThemeKey = rule?.theme || "light";
  const heroVariant: HeroVariant = getTemplate(template).heroVariant[0] || "centered";

  return {
    templateKey: getLegacyTemplateKey(template),
    themeKey: theme,
    heroVariant,
    rationale: "Tailored to your industry and business type",
  };
}

function countIssues(observations: WebsiteObservations | undefined, key: keyof WebsiteObservations) {
  return observations?.[key]?.length || 0;
}

export function suggestLayoutFromAnalysis(
  industry?: string,
  businessType?: string,
  websiteObservations?: WebsiteObservations
): SuggestedLayoutWithRationale {
  const trust = countIssues(websiteObservations, "trustIssues");
  const conversion = countIssues(websiteObservations, "conversionIssues");
  const performance = countIssues(websiteObservations, "performanceIssues");
  const hasAudit = trust + conversion + performance > 0;

  if (!hasAudit) {
    return suggestFromIndustry(industry, businessType);
  }

  if (conversion >= 2 || (conversion >= 1 && trust >= 1)) {
    return {
      templateKey: "modern-business",
      themeKey: "startup",
      heroVariant: "centered",
      rationale: "Clear CTAs and conversion-focused layout to fix weak calls-to-action",
    };
  }

  if (trust >= 2 || trust >= 1) {
    return {
      templateKey: "modern-business",
      themeKey: "light",
      heroVariant: "left-image",
      rationale: "Professional, trust-building design with strong social proof",
    };
  }

  if (performance >= 1) {
    return {
      templateKey: "minimal-fast",
      themeKey: "light",
      heroVariant: "centered",
      rationale: "Clean, fast-loading minimal layout for better performance",
    };
  }

  if (conversion >= 1) {
    return {
      templateKey: "modern-business",
      themeKey: "warm",
      heroVariant: "centered",
      rationale: "Warm, inviting design with prominent contact actions",
    };
  }

  return suggestFromIndustry(industry, businessType);
}

export function suggestAlternativeLayoutFromAnalysis(
  industry?: string,
  businessType?: string,
  websiteObservations?: WebsiteObservations
): SuggestedLayoutWithRationale {
  const recommended = suggestLayoutFromAnalysis(industry, businessType, websiteObservations);

  const alternatives: Record<LegacyTemplateKey, { templateKey: LegacyTemplateKey; themeKey: ThemeKey }> = {
    "modern-business": { templateKey: "premium-dark", themeKey: "dark" },
    "premium-dark": { templateKey: "local-bright", themeKey: "warm" },
    "local-bright": { templateKey: "modern-business", themeKey: "startup" },
    "minimal-fast": { templateKey: "premium-dark", themeKey: "luxury" },
    "ecommerce-store": { templateKey: "premium-dark", themeKey: "dark" },
  };

  const alt = alternatives[recommended.templateKey] || {
    templateKey: "premium-dark" as LegacyTemplateKey,
    themeKey: "dark" as ThemeKey,
  };

  return {
    templateKey: alt.templateKey,
    themeKey: alt.themeKey,
    heroVariant: "large-visual",
    rationale: "Bold alternative style for comparison",
  };
}

export function getDesignFixesFromAnalysis(websiteObservations?: WebsiteObservations): DesignFix[] {
  if (!websiteObservations) return [];

  const fixes: DesignFix[] = [];

  (websiteObservations.trustIssues || []).slice(0, 2).forEach((issue) => {
    fixes.push({ category: "Trust", issue, fix: "Add testimonials, credentials, and clearer contact info" });
  });

  (websiteObservations.conversionIssues || []).slice(0, 2).forEach((issue) => {
    fixes.push({ category: "Conversion", issue, fix: "Stronger CTAs, clearer hero message, and simpler user flow" });
  });

  (websiteObservations.performanceIssues || []).slice(0, 2).forEach((issue) => {
    fixes.push({ category: "Performance", issue, fix: "Lighter layout, optimized structure, and mobile-first design" });
  });

  return fixes.slice(0, 5);
}

export function suggestLayoutFor(industry?: string, businessType?: string): SuggestedLayout {
  const normalized = `${industry || ""} ${businessType || ""}`.trim();
  const rule = industryRules.find((item) => item.match.test(normalized));
  const template: TemplateKey = rule?.template || "corporate";
  const theme: ThemeKey = rule?.theme || "light";
  const heroVariant: HeroVariant = getTemplate(template).heroVariant[0] || "centered";

  return {
    templateKey: getLegacyTemplateKey(template),
    themeKey: theme,
    heroVariant,
  };
}

export function suggestAlternativeLayoutFor(industry?: string, businessType?: string): SuggestedLayout {
  const normalized = `${industry || ""} ${businessType || ""}`.trim();
  const rule = industryRules.find((item) => item.match.test(normalized));
  const recommendedTemplate: TemplateKey = rule?.template || "corporate";
  
  // Pick an alternative template that's different from recommended (avoid ecommerce for most)
  const allTemplates: TemplateKey[] = ["corporate", "creative", "minimal"];
  const alternativeTemplates = allTemplates.filter(t => t !== recommendedTemplate);
  const alternativeTemplate = alternativeTemplates[0] || "creative";
  
  // Pick an alternative theme that creates contrast
  const recommendedTheme: ThemeKey = rule?.theme || "light";
  
  // Choose a contrasting theme
  let alternativeTheme: ThemeKey;
  if (recommendedTheme === "light") {
    alternativeTheme = "dark";
  } else if (recommendedTheme === "dark") {
    alternativeTheme = "light";
  } else if (recommendedTheme === "luxury") {
    alternativeTheme = "startup";
  } else if (recommendedTheme === "startup") {
    alternativeTheme = "luxury";
  } else {
    alternativeTheme = "dark";
  }
  
  const heroVariant: HeroVariant = getTemplate(alternativeTemplate).heroVariant[0] || "centered";

  return {
    templateKey: getLegacyTemplateKey(alternativeTemplate),
    themeKey: alternativeTheme,
    heroVariant,
  };
}

export default {
  getTemplate,
  getTheme,
  getLegacyTemplateKey,
  suggestLayoutFor,
  suggestLayoutFromAnalysis,
  suggestAlternativeLayoutFromAnalysis,
  getDesignFixesFromAnalysis,
  TEMPLATES,
  THEMES,
};
