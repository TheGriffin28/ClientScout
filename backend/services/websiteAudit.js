import * as cheerio from "cheerio";

/**
 * Real website audit.
 *
 * Everything returned here is MEASURED, not guessed:
 *  - SSL / HTTPS redirect checks via real requests
 *  - Homepage HTML parsed for SEO, trust, conversion and tracking signals
 *  - Google PageSpeed Insights (mobile) for real performance scores
 *
 * The AI layer only rephrases these facts into a pitch; it must never invent issues.
 */

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const HTML_TIMEOUT_MS = 15000;
const PAGESPEED_TIMEOUT_MS = 60000;
const MAX_HTML_BYTES = 3 * 1024 * 1024;

const FREE_BUILDER_HOSTS = [
  "wixsite.com",
  "weebly.com",
  "wordpress.com",
  "blogspot.com",
  "godaddysites.com",
  "webnode.com",
  "webnode.page",
  "site123.me",
  "jimdosite.com",
  "ueniweb.com",
  "business.site",
  "sites.google.com",
];

const EMAIL_BLOCKLIST = [
  "sentry",
  "wixpress",
  "wix.com",
  "example.com",
  "domain.com",
  "yourdomain",
  "email.com",
  "godaddy.com",
  "wordpress.com",
  "schema.org",
  "w3.org",
];

export function leadHasWebsite(website) {
  if (!website || typeof website !== "string") return false;
  const trimmed = website.trim().toLowerCase();
  return Boolean(trimmed) && !["n/a", "na", "none", "no", "no website", "-"].includes(trimmed);
}

export function normalizeUrl(raw) {
  let value = String(raw || "").trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  return new URL(value);
}

/** Extracts real-looking business emails from HTML (mailto links + visible text). */
export function extractEmailsFromHtml(html) {
  if (!html) return [];
  const found = new Set();
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g;
  const decoded = html.replace(/&#64;|&#x40;|\[at\]|\(at\)/gi, "@");
  for (const match of decoded.match(regex) || []) {
    const email = match.toLowerCase().replace(/^mailto:/, "");
    if (/\.(png|jpe?g|gif|svg|webp|css|js)$/i.test(email)) continue; // e.g. logo@2x.png
    if (EMAIL_BLOCKLIST.some((bad) => email.includes(bad))) continue;
    found.add(email);
  }
  // Prefer generic business inboxes first (info@, contact@, hello@ ...)
  const preferred = ["info@", "contact@", "hello@", "enquiry@", "inquiry@", "admin@", "office@", "sales@"];
  return [...found].sort((a, b) => {
    const pa = preferred.some((p) => a.startsWith(p)) ? 0 : 1;
    const pb = preferred.some((p) => b.startsWith(p)) ? 0 : 1;
    return pa - pb;
  });
}

async function fetchHtml(url, timeoutMs = HTML_TIMEOUT_MS) {
  const started = Date.now();
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const responseTimeMs = Date.now() - started;
  let html = await res.text();
  const sizeBytes = Buffer.byteLength(html);
  if (sizeBytes > MAX_HTML_BYTES) html = html.slice(0, MAX_HTML_BYTES);
  return { res, html, responseTimeMs, sizeBytes };
}

/** Lightweight fetch used during Maps search: homepage (+ contact page) emails only. */
export async function findEmailsOnWebsite(website, timeoutMs = 5000) {
  try {
    const url = normalizeUrl(website);
    const { html, res } = await fetchHtml(url.href, timeoutMs);
    let emails = extractEmailsFromHtml(html);
    if (emails.length === 0) {
      const $ = cheerio.load(html);
      const contactHref = $("a[href]")
        .map((_, el) => $(el).attr("href"))
        .get()
        .find((href) => /contact|reach|enquir/i.test(href || ""));
      if (contactHref) {
        const contactUrl = new URL(contactHref, res.url || url.href);
        if (contactUrl.hostname === new URL(res.url || url.href).hostname) {
          const contact = await fetchHtml(contactUrl.href, timeoutMs);
          emails = extractEmailsFromHtml(contact.html);
        }
      }
    }
    return emails;
  } catch {
    return [];
  }
}

async function checkHttpRedirect(hostname) {
  try {
    const res = await fetch(`http://${hostname}/`, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    const location = res.headers.get("location") || "";
    return res.status >= 300 && res.status < 400 && location.toLowerCase().startsWith("https://");
  } catch {
    return null; // unknown
  }
}

async function runPageSpeed(url) {
  const params = new URLSearchParams({ url, strategy: "mobile" });
  ["performance", "seo", "accessibility", "best-practices"].forEach((c) => params.append("category", c));
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);

  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, {
      signal: AbortSignal.timeout(PAGESPEED_TIMEOUT_MS),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data?.error?.message || `PageSpeed HTTP ${res.status}` };
    }
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};
    const score = (c) => (typeof c?.score === "number" ? Math.round(c.score * 100) : null);
    return {
      performance: score(cats.performance),
      seo: score(cats.seo),
      accessibility: score(cats.accessibility),
      bestPractices: score(cats["best-practices"]),
      lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
      fcpMs: audits["first-contentful-paint"]?.numericValue ?? null,
      tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    };
  } catch (err) {
    return { error: err.name === "TimeoutError" ? "PageSpeed timed out" : err.message };
  }
}

function detectPlatform(html, $) {
  const generator = ($('meta[name="generator"]').attr("content") || "").toLowerCase();
  const h = html.toLowerCase();
  if (generator.includes("wordpress") || h.includes("wp-content")) return "WordPress";
  if (generator.includes("wix") || h.includes("wixstatic.com")) return "Wix";
  if (h.includes("cdn.shopify.com")) return "Shopify";
  if (generator.includes("squarespace") || h.includes("squarespace.com")) return "Squarespace";
  if (generator.includes("webflow") || h.includes("webflow.com")) return "Webflow";
  if (h.includes("img1.wsimg.com")) return "GoDaddy Website Builder";
  if (generator.includes("blogger")) return "Blogger";
  if (generator) return generator;
  return null;
}

function parseHomepage(html, finalUrl) {
  const $ = cheerio.load(html);
  const lower = html.toLowerCase();
  const hrefs = $("a[href]")
    .map((_, el) => ($(el).attr("href") || "").trim())
    .get();
  const hrefsLower = hrefs.map((h) => h.toLowerCase());
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const textLower = text.toLowerCase();

  // Very little server-rendered text => content is built by JavaScript.
  // Content-based "missing X" checks would be unreliable, so we flag it.
  const jsRendered = text.length < 400;

  const yearMatches = [...text.matchAll(/(?:©|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
  const copyrightYear = yearMatches.length ? Math.max(...yearMatches) : null;

  const socialPatterns = {
    facebook: /facebook\.com\//,
    instagram: /instagram\.com\//,
    linkedin: /linkedin\.com\//,
    youtube: /youtube\.com\//,
    twitter: /(twitter|x)\.com\//,
  };
  const socialLinks = Object.entries(socialPatterns)
    .filter(([, re]) => hrefsLower.some((h) => re.test(h)))
    .map(([name]) => name);

  const imagesTotal = $("img").length;
  const imagesMissingAlt = $("img").filter((_, el) => !($(el).attr("alt") || "").trim()).length;

  const hasFormWithInputs =
    $("form").filter((_, f) => $(f).find('input[type="email"], input[type="tel"], textarea').length > 0).length > 0;
  const embeddedForm = /typeform\.com|jotform|hsforms|forms\.gle|docs\.google\.com\/forms|wpforms|contact-form-7|elementor-form/.test(lower);

  const parkedPhrases = [
    "domain is for sale",
    "buy this domain",
    "this domain may be for sale",
    "parked free",
    "website coming soon",
    "under construction",
    "site is under maintenance",
  ];

  return {
    seo: {
      title: $("title").first().text().trim() || null,
      metaDescription: $('meta[name="description"]').attr("content")?.trim() || null,
      h1Count: $("h1").length,
      hasViewport: $('meta[name="viewport"]').length > 0,
      hasOgTags: $('meta[property^="og:"]').length > 0,
      hasFavicon: $('link[rel*="icon"]').length > 0,
      hasStructuredData: $('script[type="application/ld+json"]').length > 0 || lower.includes("application/ld+json"),
      imagesTotal,
      imagesMissingAlt,
    },
    conversion: {
      hasClickToCall: hrefsLower.some((h) => h.startsWith("tel:")),
      hasWhatsAppLink: hrefsLower.some((h) => /wa\.me|api\.whatsapp\.com|whatsapp:\/\//.test(h)) || lower.includes("wa.me/"),
      hasEmailLink: hrefsLower.some((h) => h.startsWith("mailto:")),
      hasContactForm: hasFormWithInputs || embeddedForm,
      hasBookingWidget:
        /calendly|practo|zocdoc|booksy|fresha|setmore|acuityscheduling|simplybook|opentable|zomato\.com\/.*book|book-appointment/.test(lower) ||
        /book (an )?appointment|book now|schedule (a )?(visit|consultation|appointment)/.test(textLower),
    },
    trust: {
      hasTestimonials: /testimonial|what our (clients|customers|patients) say|client reviews|customer reviews|google reviews/.test(textLower),
      hasPrivacyPolicy: hrefsLower.some((h) => h.includes("privacy")) || textLower.includes("privacy policy"),
      hasAboutPage: hrefsLower.some((h) => /about/.test(h)),
      socialLinks,
      copyrightYear,
    },
    tracking: {
      googleAnalytics: /gtag\(|google-analytics\.com|googletagmanager\.com\/gtag/.test(lower),
      googleTagManager: /googletagmanager\.com\/gtm\.js|gtm-[a-z0-9]+/i.test(lower),
      metaPixel: /connect\.facebook\.net\/.*fbevents\.js|fbq\(/.test(lower),
    },
    platform: detectPlatform(html, $),
    parked: parkedPhrases.some((p) => textLower.includes(p)),
    jsRendered,
    emails: extractEmailsFromHtml(html),
    finalHost: new URL(finalUrl).hostname,
  };
}

function classifyFetchError(err) {
  const code = err?.cause?.code || err?.code || "";
  const certCodes = [
    "CERT_HAS_EXPIRED",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "ERR_TLS_CERT_ALTNAME_INVALID",
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  ];
  if (certCodes.includes(code)) return { type: "ssl", code };
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return { type: "dns", code };
  if (err?.name === "TimeoutError") return { type: "timeout", code: "TIMEOUT" };
  return { type: "network", code: code || err?.message || "UNKNOWN" };
}

/**
 * Full audit of a website. Never throws: unreachable sites are returned as findings.
 */
export async function auditWebsite(rawUrl, { includePageSpeed = true } = {}) {
  const auditedAt = new Date();

  if (!leadHasWebsite(rawUrl)) {
    return { hasWebsite: false, auditedAt };
  }

  let url;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return { hasWebsite: true, reachable: false, inputUrl: rawUrl, error: "Invalid website URL", auditedAt };
  }

  const audit = {
    hasWebsite: true,
    inputUrl: rawUrl,
    finalUrl: null,
    reachable: false,
    statusCode: null,
    error: null,
    responseTimeMs: null,
    pageSizeKb: null,
    freeBuilderSubdomain: FREE_BUILDER_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)),
    https: { supported: false, validCertificate: null, httpRedirectsToHttps: null, certError: null },
    pageSpeed: null,
    auditedAt,
  };

  // Run PageSpeed in parallel – it is the slowest part.
  const pageSpeedPromise = includePageSpeed ? runPageSpeed(`https://${url.hostname}${url.pathname}`) : Promise.resolve(null);

  let fetched = null;
  try {
    fetched = await fetchHtml(`https://${url.hostname}${url.pathname}${url.search}`);
    audit.https.supported = true;
    audit.https.validCertificate = true;
  } catch (err) {
    const info = classifyFetchError(err);
    if (info.type === "ssl") {
      audit.https.supported = true;
      audit.https.validCertificate = false;
      audit.https.certError = info.code;
    }
    // Fall back to plain HTTP so we can still audit the content
    try {
      fetched = await fetchHtml(`http://${url.hostname}${url.pathname}${url.search}`);
    } catch (httpErr) {
      const httpInfo = classifyFetchError(httpErr);
      audit.error =
        info.type === "dns" || httpInfo.type === "dns"
          ? "Domain does not resolve (DNS error) - website is down or expired"
          : info.type === "timeout"
          ? "Website did not respond within 15 seconds"
          : `Website could not be loaded (${httpInfo.code})`;
    }
  }

  if (fetched) {
    const finalUrl = fetched.res.url || url.href;
    audit.finalUrl = finalUrl;
    audit.statusCode = fetched.res.status;
    audit.reachable = fetched.res.ok;
    audit.responseTimeMs = fetched.responseTimeMs;
    audit.pageSizeKb = Math.round(fetched.sizeBytes / 1024);
    if (finalUrl.startsWith("https://")) audit.https.supported = true;
    if (!fetched.res.ok) audit.error = `Homepage returned HTTP ${fetched.res.status}`;

    if (fetched.res.ok) {
      Object.assign(audit, parseHomepage(fetched.html, finalUrl));
      if (!audit.emails?.length) {
        audit.emails = await findEmailsOnWebsite(finalUrl, 6000);
      }
    }
  }

  if (audit.https.supported && audit.https.validCertificate !== false) {
    audit.https.httpRedirectsToHttps = await checkHttpRedirect(url.hostname);
  }

  audit.pageSpeed = await pageSpeedPromise;
  return audit;
}

const secs = (ms) => (ms / 1000).toFixed(1);

/**
 * Turns measured audit data into factual, pitch-ready findings.
 * Only reports things we actually verified.
 */
export function buildObservationsFromAudit(audit) {
  const performanceIssues = [];
  const trustIssues = [];
  const conversionIssues = [];

  if (!audit || audit.hasWebsite === false) {
    return {
      performanceIssues,
      trustIssues: ["No website - customers who search online cannot verify the business beyond the Google Maps listing"],
      conversionIssues: ["No website to capture enquiries, bookings or show services and prices"],
    };
  }

  if (!audit.reachable) {
    trustIssues.push(audit.error || "Website could not be loaded");
    if (audit.https?.validCertificate === false) {
      trustIssues.push(`SSL certificate is invalid (${audit.https.certError}) - browsers show a security warning`);
    }
    return { performanceIssues, trustIssues, conversionIssues };
  }

  // ---- Performance & SEO (measured) ----
  const ps = audit.pageSpeed;
  if (ps && !ps.error) {
    if (typeof ps.performance === "number" && ps.performance < 50) {
      performanceIssues.push(`Google PageSpeed mobile score is ${ps.performance}/100 (rated "poor")`);
    } else if (typeof ps.performance === "number" && ps.performance < 90) {
      performanceIssues.push(`Google PageSpeed mobile score is ${ps.performance}/100 (needs improvement)`);
    }
    if (typeof ps.lcpMs === "number" && ps.lcpMs > 2500) {
      performanceIssues.push(`Main content takes ${secs(ps.lcpMs)}s to appear on mobile (Google target: under 2.5s)`);
    }
    if (typeof ps.cls === "number" && ps.cls > 0.1) {
      performanceIssues.push(`Page layout jumps while loading (CLS ${ps.cls.toFixed(2)}, Google target: under 0.1)`);
    }
    if (typeof ps.seo === "number" && ps.seo < 80) {
      performanceIssues.push(`Google Lighthouse SEO score is ${ps.seo}/100`);
    }
  } else if (audit.responseTimeMs > 3000) {
    performanceIssues.push(`Homepage took ${secs(audit.responseTimeMs)}s to respond`);
  }

  if (audit.seo) {
    if (!audit.seo.hasViewport) performanceIssues.push("No mobile viewport tag - the site is not set up for mobile screens");
    if (!audit.seo.title) performanceIssues.push("Homepage has no page title (hurts Google ranking)");
    if (!audit.seo.metaDescription) performanceIssues.push("No meta description - Google shows a random snippet in search results");
    if (audit.seo.h1Count === 0 && !audit.jsRendered) performanceIssues.push("No main heading (H1) on the homepage");
    if (audit.seo.imagesTotal > 0 && audit.seo.imagesMissingAlt / audit.seo.imagesTotal > 0.5) {
      performanceIssues.push(`${audit.seo.imagesMissingAlt} of ${audit.seo.imagesTotal} images have no alt text (missed image SEO)`);
    }
    if (!audit.seo.hasStructuredData) performanceIssues.push("No local business schema markup for Google rich results");
  }

  // ---- Trust (measured) ----
  if (!audit.https?.supported) {
    trustIssues.push('No HTTPS - browsers mark the site "Not Secure"');
  } else if (audit.https.validCertificate === false) {
    trustIssues.push(`SSL certificate is invalid (${audit.https.certError}) - visitors see a security warning`);
  } else if (audit.https.httpRedirectsToHttps === false) {
    trustIssues.push('The http:// version does not redirect to https:// - some visitors see "Not Secure"');
  }
  if (audit.parked) trustIssues.push("Site shows a parked / coming soon / under construction page");
  if (audit.freeBuilderSubdomain) trustIssues.push(`Hosted on a free builder subdomain (${audit.finalHost}) instead of an own domain`);

  const currentYear = new Date().getFullYear();
  if (audit.trust?.copyrightYear && audit.trust.copyrightYear < currentYear - 1) {
    trustIssues.push(`Footer copyright still says ${audit.trust.copyrightYear} - site looks unmaintained`);
  }

  // Content checks are skipped for JS-rendered sites to avoid false claims.
  if (audit.trust && !audit.jsRendered) {
    if (!audit.trust.hasTestimonials) trustIssues.push("No testimonials or customer reviews shown on the homepage");
    if (!audit.trust.hasPrivacyPolicy) trustIssues.push("No privacy policy linked");
    if (audit.trust.socialLinks.length === 0) trustIssues.push("No links to social media profiles");
  }

  // ---- Conversion (measured) ----
  if (audit.conversion && !audit.jsRendered) {
    if (!audit.conversion.hasClickToCall) conversionIssues.push("No click-to-call link - mobile visitors cannot tap to call");
    if (!audit.conversion.hasWhatsAppLink) conversionIssues.push("No WhatsApp chat button");
    if (!audit.conversion.hasContactForm && !audit.conversion.hasBookingWidget) {
      conversionIssues.push("No enquiry form or online booking - visitors have no way to leave their details");
    }
  }
  if (audit.tracking) {
    if (!audit.tracking.googleAnalytics && !audit.tracking.googleTagManager) {
      conversionIssues.push("No Google Analytics - the business cannot see how many visitors it gets");
    }
    if (!audit.tracking.metaPixel) {
      conversionIssues.push("No Meta (Facebook/Instagram) Pixel - cannot retarget website visitors with ads");
    }
  }

  return { performanceIssues, trustIssues, conversionIssues };
}

/** Compact fact sheet for the AI prompt. */
export function summarizeAuditForPrompt(audit) {
  if (!audit || audit.hasWebsite === false) return { hasWebsite: false };
  return {
    hasWebsite: true,
    reachable: audit.reachable,
    error: audit.error,
    finalUrl: audit.finalUrl,
    platform: audit.platform,
    https: audit.https,
    responseTimeMs: audit.responseTimeMs,
    pageSpeedMobile: audit.pageSpeed && !audit.pageSpeed.error ? audit.pageSpeed : "unavailable",
    seo: audit.seo,
    conversion: audit.conversion,
    trust: audit.trust,
    tracking: audit.tracking,
    parked: audit.parked,
    freeBuilderSubdomain: audit.freeBuilderSubdomain,
    contentRenderedByJavaScript: audit.jsRendered,
  };
}
