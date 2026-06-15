// Template + Theme model definitions for ClientScout
// Lightweight starter for Template Layer and Theme Layer

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export type TemplateKey = "corporate" | "creative" | "minimal" | "ecommerce" | "bold" | "elegant" | "playful" | "technical" | "nature";
export type LegacyTemplateKey = "modern-business" | "premium-dark" | "local-bright" | "minimal-fast" | "ecommerce-store" | "bold-edge" | "elegant-classic" | "playful-fun" | "technical-pro" | "nature-green";

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
  bold: "bold-edge",
  elegant: "elegant-classic",
  playful: "playful-fun",
  technical: "technical-pro",
  nature: "nature-green",
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
    heroVariant: ["centered", "left-image"],
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
  bold: {
    key: "bold",
    name: "Bold / Edgy",
    description: "Large visual hero, quote, services, stats, CTA, about, testimonials, contact",
    heroVariant: ["large-visual", "left-image"],
    sectionsOrder: ["hero", "quote", "services", "stats", "cta", "about", "testimonials", "contact", "footer"],
    cardStyle: "overlap",
    spacing: "spacious",
  },
  elegant: {
    key: "elegant",
    name: "Elegant / Classic",
    description: "Centered hero, about, services, testimonials, gallery, CTA, contact",
    heroVariant: ["centered", "left-image"],
    sectionsOrder: ["hero", "about", "services", "testimonials", "gallery", "cta", "contact", "footer"],
    cardStyle: "grid",
    spacing: "regular",
  },
  playful: {
    key: "playful",
    name: "Playful / Fun",
    description: "Large visual hero, features, services, testimonials, gallery, quote, CTA, contact",
    heroVariant: ["large-visual", "centered"],
    sectionsOrder: ["hero", "features", "services", "testimonials", "gallery", "quote", "cta", "contact", "footer"],
    cardStyle: "overlap",
    spacing: "spacious",
  },
  technical: {
    key: "technical",
    name: "Technical / Professional",
    description: "Left-image hero, stats, features, services, about, testimonials, CTA, contact",
    heroVariant: ["left-image", "centered"],
    sectionsOrder: ["hero", "stats", "features", "services", "about", "testimonials", "cta", "contact", "footer"],
    cardStyle: "list",
    spacing: "dense",
  },
  nature: {
    key: "nature",
    name: "Nature / Green",
    description: "Large visual hero, features, about, services, testimonials, gallery, CTA, contact",
    heroVariant: ["large-visual", "left-image"],
    sectionsOrder: ["hero", "features", "about", "services", "testimonials", "gallery", "cta", "contact", "footer"],
    cardStyle: "grid",
    spacing: "regular",
  },
};

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  light: {
    key: "light",
    displayName: "Light",
    colors: { primary: "#1e293b", accent: "#2563eb", background: "#f8fafc", surface: "#ffffff", text: "#1e293b" },
    fonts: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "16px", rounded: "10px" },
  },
  dark: {
    key: "dark",
    displayName: "Dark",
    colors: { primary: "#e5e7eb", accent: "#f59e0b", background: "#030712", surface: "#0f172a", text: "#e5e7eb" },
    fonts: { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "16px", rounded: "10px" },
  },
  luxury: {
    key: "luxury",
    displayName: "Luxury",
    colors: { primary: "#f8fafc", accent: "#facc15", background: "#020617", surface: "#0f172a", text: "#f8fafc" },
    fonts: { heading: "Playfair Display, Georgia, serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "20px", rounded: "12px" },
  },
  startup: {
    key: "startup",
    displayName: "Startup",
    colors: { primary: "#0f172a", accent: "#ec4899", background: "#ffffff", surface: "#fdf2f8", text: "#0f172a" },
    fonts: { heading: "Poppins, sans-serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "14px", rounded: "999px" },
  },
  warm: {
    key: "warm",
    displayName: "Warm",
    colors: { primary: "#431407", accent: "#f97316", background: "#fff7ed", surface: "#ffedd5", text: "#431407" },
    fonts: { heading: "Merriweather, Georgia, serif", body: "Inter, system-ui, sans-serif" },
    radii: { soft: "16px", rounded: "10px" },
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

const industryRules: Array<{ match: RegExp; template: TemplateKey; themes: ThemeKey[] }> = [
  { match: /agency|creative|design|marketing|media/i, template: "creative", themes: ["startup", "dark", "luxury"] },
  { match: /startup|software|technology|tech/i, template: "bold", themes: ["startup", "dark", "warm"] },
  { match: /education|training|academy|school|coaching|tutoring|learning/i, template: "corporate", themes: ["warm", "light", "startup"] },
  { match: /restaurant|food|cafe|fitness|gym|salon|spa|wellness|local|retail|home services|services/i, template: "minimal", themes: ["warm", "light", "dark"] },
  { match: /finance|legal|consulting|medical|health|real estate|insurance|construction/i, template: "corporate", themes: ["dark", "light", "luxury"] },
  { match: /fashion|luxury|jewelry|boutique|hotel|hospitality/i, template: "elegant", themes: ["luxury", "dark", "warm"] },
  { match: /kids|children|toys|family|events|party/i, template: "playful", themes: ["startup", "warm", "light"] },
  { match: /engineering|software development|data science|ai|machine learning/i, template: "technical", themes: ["dark", "startup", "luxury"] },
  { match: /gardening|outdoors|eco|environment|sustainability|organic/i, template: "nature", themes: ["warm", "light", "luxury"] },
];

function suggestFromIndustry(industry?: string, businessType?: string): SuggestedLayoutWithRationale {
  const normalized = `${industry || ""} ${businessType || ""}`.trim();
  const rule = industryRules.find((item) => item.match.test(normalized));
  const template: TemplateKey = rule?.template || "corporate";
  const themes: ThemeKey[] = rule?.themes || ["light", "dark", "luxury", "startup", "warm"];
  const theme: ThemeKey = getRandomItem(themes);
  const heroVariants = getTemplate(template).heroVariant;
  const heroVariant: HeroVariant = getRandomItem(heroVariants);

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
    const templateKey = "modern-business";
    const template: TemplateKey = "corporate";
    const heroVariants = getTemplate(template).heroVariant;
    return {
      templateKey,
      themeKey: getRandomItem(["startup", "light", "warm"]),
      heroVariant: getRandomItem(heroVariants),
      rationale: "Clear CTAs and conversion-focused layout to fix weak calls-to-action",
    };
  }

  if (trust >= 2 || trust >= 1) {
    const templateKey = "modern-business";
    const template: TemplateKey = "corporate";
    const heroVariants = getTemplate(template).heroVariant;
    return {
      templateKey,
      themeKey: getRandomItem(["light", "dark", "luxury"]),
      heroVariant: getRandomItem(heroVariants),
      rationale: "Professional, trust-building design with strong social proof",
    };
  }

  if (performance >= 1) {
    const templateKey = "local-bright";
    const template: TemplateKey = "minimal";
    const heroVariants = getTemplate(template).heroVariant;
    return {
      templateKey,
      themeKey: getRandomItem(["light", "warm"]),
      heroVariant: getRandomItem(heroVariants),
      rationale: "Clean, fast-loading minimal layout for better performance",
    };
  }

  if (conversion >= 1) {
    const templateKey = "modern-business";
    const template: TemplateKey = "corporate";
    const heroVariants = getTemplate(template).heroVariant;
    return {
      templateKey,
      themeKey: getRandomItem(["warm", "startup", "light"]),
      heroVariant: getRandomItem(heroVariants),
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

  const alternatives: Record<LegacyTemplateKey, { templateKey: LegacyTemplateKey; themes: ThemeKey[] }> = {
    "modern-business": { templateKey: "premium-dark", themes: ["dark", "luxury", "startup"] },
    "premium-dark": { templateKey: "local-bright", themes: ["warm", "light", "startup"] },
    "local-bright": { templateKey: "modern-business", themes: ["startup", "light", "warm"] },
    "minimal-fast": { templateKey: "premium-dark", themes: ["luxury", "dark", "startup"] },
    "ecommerce-store": { templateKey: "premium-dark", themes: ["dark", "luxury", "warm"] },
    "bold-edge": { templateKey: "elegant-classic", themes: ["luxury", "light", "warm"] },
    "elegant-classic": { templateKey: "playful-fun", themes: ["startup", "light", "warm"] },
    "playful-fun": { templateKey: "technical-pro", themes: ["dark", "light", "luxury"] },
    "technical-pro": { templateKey: "nature-green", themes: ["warm", "light", "luxury"] },
    "nature-green": { templateKey: "bold-edge", themes: ["dark", "luxury", "startup"] },
  };

  const alt = alternatives[recommended.templateKey] || {
    templateKey: "premium-dark" as LegacyTemplateKey,
    themes: ["dark", "luxury", "startup"] as ThemeKey[],
  };
  
  const templateKey = alt.templateKey;
  // Map legacy template key back to TemplateKey to get hero variants
  const legacyToTemplate: Record<LegacyTemplateKey, TemplateKey> = {
    "modern-business": "corporate",
    "premium-dark": "creative",
    "local-bright": "minimal",
    "minimal-fast": "minimal",
    "ecommerce-store": "ecommerce",
    "bold-edge": "bold",
    "elegant-classic": "elegant",
    "playful-fun": "playful",
    "technical-pro": "technical",
    "nature-green": "nature",
  };
  const template = legacyToTemplate[templateKey];
  const heroVariants = getTemplate(template).heroVariant;

  return {
    templateKey,
    themeKey: getRandomItem(alt.themes),
    heroVariant: getRandomItem(heroVariants),
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
  const themes: ThemeKey[] = rule?.themes || ["light", "dark", "luxury", "startup", "warm"];
  const theme: ThemeKey = getRandomItem(themes);
  const heroVariants = getTemplate(template).heroVariant;
  const heroVariant: HeroVariant = getRandomItem(heroVariants);

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
  const allTemplates: TemplateKey[] = ["corporate", "creative", "minimal", "bold", "elegant", "playful", "technical", "nature"];
  const alternativeTemplates = allTemplates.filter(t => t !== recommendedTemplate);
  const alternativeTemplate = alternativeTemplates.length ? getRandomItem(alternativeTemplates) : "creative";
  
  // Pick an alternative theme that creates contrast
  const recommendedTheme: ThemeKey = rule?.themes ? getRandomItem(rule.themes) : "light";
  
  // Choose a contrasting theme
  let alternativeThemes: ThemeKey[];
  if (recommendedTheme === "light") {
    alternativeThemes = ["dark", "luxury"];
  } else if (recommendedTheme === "dark") {
    alternativeThemes = ["light", "startup", "warm"];
  } else if (recommendedTheme === "luxury") {
    alternativeThemes = ["startup", "light", "warm"];
  } else if (recommendedTheme === "startup") {
    alternativeThemes = ["luxury", "dark", "warm"];
  } else { // warm
    alternativeThemes = ["dark", "luxury", "startup"];
  }
  
  const heroVariants = getTemplate(alternativeTemplate).heroVariant;

  return {
    templateKey: getLegacyTemplateKey(alternativeTemplate),
    themeKey: getRandomItem(alternativeThemes),
    heroVariant: getRandomItem(heroVariants),
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
