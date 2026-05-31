const LEGACY_TEMPLATE_MAP = {
  corporate: "modern-business",
  creative: "premium-dark",
  minimal: "local-bright",
  ecommerce: "ecommerce-store",
};

const industryRules = [
  { match: /agency|creative|design|marketing|media|startup|software|technology|tech/i, template: "creative", theme: "startup" },
  { match: /education|training|academy|school|coaching|tutoring|learning/i, template: "corporate", theme: "warm" },
  { match: /restaurant|food|cafe|fitness|gym|salon|spa|wellness|local|retail|home services|services/i, template: "minimal", theme: "warm" },
  { match: /finance|legal|consulting|medical|health|real estate|insurance|construction/i, template: "corporate", theme: "dark" },
  { match: /fashion|luxury|jewelry|boutique|hotel|hospitality/i, template: "creative", theme: "luxury" },
];

function suggestFromIndustry(industry, businessType) {
  const normalized = `${industry || ""} ${businessType || ""}`.trim();
  const rule = industryRules.find((item) => item.match.test(normalized));
  const template = rule?.template || "corporate";
  const theme = rule?.theme || "light";
  return {
    templateKey: LEGACY_TEMPLATE_MAP[template] || "modern-business",
    themeKey: theme,
    rationale: "Tailored to your industry and business type",
  };
}

function countIssues(observations, key) {
  return observations?.[key]?.length || 0;
}

/** Pick recommended template/theme using AI audit findings + industry fallback. */
export function suggestLayoutFromAnalysis(industry, businessType, websiteObservations) {
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
      rationale: "Clear CTAs and conversion-focused layout to fix weak calls-to-action",
    };
  }

  if (trust >= 2 || trust >= 1) {
    return {
      templateKey: "modern-business",
      themeKey: "light",
      rationale: "Professional, trust-building design with strong social proof",
    };
  }

  if (performance >= 1) {
    return {
      templateKey: "minimal-fast",
      themeKey: "light",
      rationale: "Clean, fast-loading minimal layout for better performance",
    };
  }

  if (conversion >= 1) {
    return {
      templateKey: "modern-business",
      themeKey: "warm",
      rationale: "Warm, inviting design with prominent contact actions",
    };
  }

  return suggestFromIndustry(industry, businessType);
}

/** Alternative design — contrasts with the recommended pick. */
export function suggestAlternativeLayoutFromAnalysis(industry, businessType, websiteObservations) {
  const recommended = suggestLayoutFromAnalysis(industry, businessType, websiteObservations);

  const alternatives = {
    "modern-business": { templateKey: "premium-dark", themeKey: "dark" },
    "premium-dark": { templateKey: "local-bright", themeKey: "warm" },
    "local-bright": { templateKey: "modern-business", themeKey: "startup" },
    "minimal-fast": { templateKey: "premium-dark", themeKey: "luxury" },
  };

  const alt = alternatives[recommended.templateKey] || {
    templateKey: "premium-dark",
    themeKey: "dark",
  };

  return {
    ...alt,
    rationale: "Bold alternative style for comparison",
  };
}

/** Human-readable fixes list for UI and pitch copy. */
export function getDesignFixesFromAnalysis(websiteObservations) {
  if (!websiteObservations) return [];

  const fixes = [];

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

export function leadHasWebsite(website) {
  if (!website || typeof website !== "string") return false;
  const trimmed = website.trim().toLowerCase();
  if (!trimmed || ["n/a", "na", "none", "no", "no website", "-"].includes(trimmed)) {
    return false;
  }
  return true;
}
