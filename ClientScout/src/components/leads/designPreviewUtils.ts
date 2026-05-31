import {
  LegacyTemplateKey,
  ThemeKey,
  suggestLayoutFor,
  suggestAlternativeLayoutFor,
  suggestLayoutFromAnalysis,
  suggestAlternativeLayoutFromAnalysis,
} from "../../services/templateEngine";
import { LayoutVersion, Lead } from "../../services/leadService";

export const AVAILABLE_TEMPLATES: LegacyTemplateKey[] = [
  "modern-business",
  "premium-dark",
  "local-bright",
];

export const AVAILABLE_THEMES: ThemeKey[] = ["light", "dark", "luxury", "startup", "warm"];

export const templateNames: Record<LegacyTemplateKey, string> = {
  "modern-business": "Corporate / Professional",
  "premium-dark": "Creative / Modern",
  "local-bright": "Local / Bright",
  "minimal-fast": "Clean / Minimal",
  "ecommerce-store": "E-commerce / Store",
};

export const themeNames: Record<ThemeKey, string> = {
  light: "Light",
  dark: "Dark",
  luxury: "Luxury",
  startup: "Startup",
  warm: "Warm",
};

export function getPreviewUrl(businessName?: string) {
  return `${businessName?.toLowerCase().replace(/\s+/g, "-") || "preview"}.clientscout.app`;
}

export const RECOMMENDED_VERSION_ID = "recommended";
export const ALTERNATIVE_VERSION_ID = "alternative";

/** Match a layout version to the client-approved design (IDs are regenerated on reload). */
export function isVersionClientApproved(version: LayoutVersion, lead: Lead): boolean {
  if (!lead.clientApproved) return false;

  if (lead.clientApprovedLayoutId && version.id === lead.clientApprovedLayoutId) {
    return true;
  }

  if (lead.clientApprovedLayoutName && version.name === lead.clientApprovedLayoutName) {
    return true;
  }

  const approvedName = (lead.clientApprovedLayoutName || "").toLowerCase();
  if (approvedName.includes("recommended") && version.isRecommended) return true;
  if (approvedName.includes("alternative") && !version.isRecommended) return true;

  return false;
}

export function ensureLayoutContent(content: any, businessName: string) {
  return {
    hero: content?.hero || {
      headline: `${businessName} — We Help You Grow`,
      tagline: "AI-generated website concept",
      primaryCta: "Get Started",
      secondaryCta: "Learn More",
    },
    about: content?.about || {
      title: `About ${businessName}`,
      description: "We provide exceptional services to help your business succeed.",
    },
    services: content?.services?.length ? content.services : [
      { name: "Service One", description: "Description of service one." },
      { name: "Service Two", description: "Description of service two." },
      { name: "Service Three", description: "Description of service three." },
    ],
    testimonials: content?.testimonials?.length ? content.testimonials : [
      { name: "A Happy Customer", quote: "They helped our business grow tremendously." },
    ],
    contact: content?.contact || {
      phone: "",
      address: "",
      ctaText: "Contact Us",
    },
    gallery: content?.gallery || [],
  };
}

export const EDITOR_DATA_KEY = "clientScout_editor_data";
export const EDITOR_RESULT_KEY = "clientScout_editor_result";

export interface DesignEditorData {
  leadId: string;
  version: LayoutVersion;
  businessName: string;
  industry?: string;
  businessType?: string;
}

export interface DesignEditorResult {
  leadId: string;
  versionId: string;
  version: LayoutVersion;
}

/** Legacy key — same layout as local-bright; normalized in the design editor picker. */
export function normalizeTemplateKey(key: LegacyTemplateKey): LegacyTemplateKey {
  return key === "minimal-fast" ? "local-bright" : key;
}

export function leadHasWebsite(website?: string): boolean {
  if (!website?.trim()) return false;
  const trimmed = website.trim().toLowerCase();
  return !["n/a", "na", "none", "no", "no website", "-"].includes(trimmed);
}

export function hasPreparedDesigns(lead: Lead): boolean {
  return Boolean(lead.designsPreparedAt && lead.generatedLayout?.content);
}

export function hasEmailDraft(lead: Lead): boolean {
  return Boolean(
    lead.emailDraft?.generatedAt &&
      lead.emailDraft?.subject?.trim() &&
      lead.emailDraft?.body?.trim()
  );
}

export function hasWhatsAppDraft(lead: Lead): boolean {
  return Boolean(
    lead.whatsappDraft?.generatedAt && lead.whatsappDraft?.body?.trim()
  );
}

export function buildLayoutVersionsFromLead(lead: Lead): LayoutVersion[] {
  if (!hasPreparedDesigns(lead)) return [];
  if (lead.layoutVersions?.length) return lead.layoutVersions;
  if (!lead.generatedLayout) return [];

  const hasAnalysis = Boolean(lead.websiteObservations && lead.aiGeneratedAt);
  const recommendedSuggestion = hasAnalysis
    ? suggestLayoutFromAnalysis(lead.industry, lead.businessType, lead.websiteObservations)
    : suggestLayoutFor(lead.industry, lead.businessType);
  const alternativeSuggestion = hasAnalysis
    ? suggestAlternativeLayoutFromAnalysis(lead.industry, lead.businessType, lead.websiteObservations)
    : suggestAlternativeLayoutFor(lead.industry, lead.businessType);

  const safeContent = ensureLayoutContent(lead.generatedLayout.content, lead.businessName);
  const storedTemplate = lead.generatedLayout.templateKey as LegacyTemplateKey;
  const storedTheme = (lead.generatedLayout as { themeKey?: ThemeKey }).themeKey;

  return [
    {
      id: RECOMMENDED_VERSION_ID,
      name: "Recommended Design",
      description:
        (lead.generatedLayout as { designRationale?: string }).designRationale ||
        "Professional, trust-building design perfect for conversions",
      templateKey: storedTemplate || recommendedSuggestion.templateKey,
      themeKey: storedTheme || recommendedSuggestion.themeKey,
      content: safeContent,
      pitchMessage: lead.generatedLayout.pitchMessage,
      previewUrl: lead.generatedLayout.previewUrl,
      generatedAt: lead.generatedLayout.generatedAt || new Date().toISOString(),
      isRecommended: true,
    },
    {
      id: ALTERNATIVE_VERSION_ID,
      name: "Alternative Style",
      description: alternativeSuggestion.rationale || "Modern, bold design with a more creative feel",
      templateKey: alternativeSuggestion.templateKey,
      themeKey: alternativeSuggestion.themeKey,
      content: safeContent,
      pitchMessage: lead.generatedLayout.pitchMessage,
      previewUrl: lead.generatedLayout.previewUrl,
      generatedAt: lead.generatedLayout.generatedAt || new Date().toISOString(),
      isRecommended: false,
    },
  ];
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    // Uses the domain the user is on — live site, staging, or localhost in dev
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL?.replace(/\/$/, "") || "";
}

/** Client share link — always uses the current site origin on live (never hardcoded localhost). */
export function buildLeadDesignShareUrl(leadId: string): string {
  return `${getAppOrigin()}/preview?leadId=${leadId}`;
}

/** @deprecated Prefer buildLeadDesignShareUrl — kept for legacy encoded links */
export function buildBothDesignsShareUrl(
  leadId: string,
  _businessName: string,
  _versions: LayoutVersion[]
): string {
  return buildLeadDesignShareUrl(leadId);
}

export function enrichLeadWithDesigns(lead: Lead): Lead {
  if (!hasPreparedDesigns(lead)) return lead;
  return {
    ...lead,
    layoutVersions: buildLayoutVersionsFromLead(lead),
  };
}

export const DESIGN_LINK_NOTE =
  "We prepared 2 custom website design concepts for your business. Use the button below to review and choose your preferred design.";

export const DESIGN_PLACEHOLDER_NOTE =
  "Note: Images and content shown in the preview are sample placeholders — we will update everything with your actual photos, branding, and business details as per your reference.";

export const EMAIL_DESIGN_FOOTER =
  `${DESIGN_LINK_NOTE}\n\n${DESIGN_PLACEHOLDER_NOTE}`;

export const WHATSAPP_DESIGN_LINK_NOTE =
  "We also prepared 2 custom website design previews for you — tap the link below to review them:";

export const WHATSAPP_DESIGN_FOOTER =
  `${WHATSAPP_DESIGN_LINK_NOTE}\n\n${DESIGN_PLACEHOLDER_NOTE}`;
