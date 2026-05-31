/**
 * Public frontend base URL (no trailing slash).
 * Set FRONTEND_URL or CLIENT_URL in production, e.g. https://app.clientscout.xyz
 * localhost is only used as a dev fallback when NODE_ENV is not production.
 */
export function getFrontendUrl() {
  const configured = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:5173";
}

export function buildLeadPreviewUrl(leadId) {
  const base = getFrontendUrl();
  if (!base) {
    return `/preview?leadId=${leadId}`;
  }
  return `${base}/preview?leadId=${leadId}`;
}
