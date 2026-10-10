import { findEmailsOnWebsite } from "./websiteAudit.js";

/**
 * Backend Google Maps search service using Serper.
 * The Serper API key remains strictly on the server and is never sent to the browser.
 */

const normalizeCategory = (rawCategory, query, name) => {
  const source = `${rawCategory || ""} ${query || ""} ${name || ""}`.toLowerCase();
  if (source.includes("salon") || source.includes("hair") || source.includes("spa")) return "Salon";
  if (source.includes("dent") || source.includes("clinic") || source.includes("orthodont")) return "Dentist";
  if (source.includes("gym") || source.includes("fitness") || source.includes("yoga")) return "Gym";
  if (source.includes("cafe") || source.includes("coffee") || source.includes("restaurant") || source.includes("food")) return "Cafe";
  if (source.includes("real estate") || source.includes("property")) return "Real Estate";
  if (source.includes("doctor") || source.includes("hospital")) return "Healthcare";
  if (rawCategory && String(rawCategory).trim()) return String(rawCategory).trim();
  return "Local Business";
};

const extractCity = (address) => {
  if (!address || typeof address !== "string") return undefined;
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return parts[0];
  return parts[parts.length - 2];
};

const cleanReviewText = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").replace(/[^\x20-\x7E]/g, "").trim();
};

const toNumberField = (val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const p = parseFloat(val);
    if (!Number.isNaN(p)) return p;
  }
  return undefined;
};

const extractReviewTexts = (place) => {
  const output = [];
  const reviews = place.reviews;
  if (Array.isArray(reviews)) {
    reviews.forEach((r) => {
      if (typeof r === "string") output.push(r);
      else if (r && typeof r === "object") {
        const text = r.text || r.snippet;
        if (typeof text === "string") output.push(text);
      }
    });
  }
  const snippets = place.reviewSnippets || place.review_snippets;
  if (Array.isArray(snippets)) {
    snippets.forEach((s) => {
      if (typeof s === "string") output.push(s);
    });
  }
  const cleaned = output.map(cleanReviewText).filter((t) => t.length >= 20);
  return [...new Set(cleaned)].slice(0, 5);
};

const computeLeadScore = (website, rating, reviewCount) => {
  let score = 0;
  if (!website || !String(website).trim()) score += 5;
  if (rating === undefined) score += 1;
  else if (rating < 4) score += 2;
  else if (rating < 4.4) score += 1;

  if (reviewCount === undefined) score += 1;
  else if (reviewCount <= 20) score += 2;
  else if (reviewCount <= 80) score += 1;

  const opportunityLabel =
    score >= 7 ? "High Conversion Potential" : score >= 4 ? "Medium Potential" : "Low Potential";

  const tags = [];
  if (!website || !String(website).trim()) tags.push("No Website");
  if (score >= 7) tags.push("High Opportunity");
  return { score, opportunityLabel, tags };
};

const geocodeLocation = async (location, apiKey) => {
  if (!apiKey || !location) return undefined;
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: location }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data.knowledgeGraph?.latitude && data.knowledgeGraph?.longitude) {
      return `@${data.knowledgeGraph.latitude},${data.knowledgeGraph.longitude},13z`;
    }
    const place = data.places?.[0] || data.localResults?.[0] || data.local_results?.[0];
    const lat = place?.latitude || place?.lat;
    const lng = place?.longitude || place?.lng;
    if (lat && lng) return `@${lat},${lng},13z`;
    return undefined;
  } catch (err) {
    console.warn("Geocoding failed for", location, err.message);
    return undefined;
  }
};

const searchSerperEmail = async (name, website, address, apiKey) => {
  if (!apiKey) return undefined;
  try {
    let query = "";
    if (website) {
      try {
        const domain = new URL(
          website.startsWith("http") ? website : `https://${website}`
        ).hostname.replace("www.", "");
        query = `site:${domain} "email" OR "contact"`;
      } catch {
        query = `${name} ${address || ""} contact email`;
      }
    } else {
      query = `${name} ${address || ""} contact email`;
    }

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 3 }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const snippets = [
      ...(data.organic || []).map((r) => r.snippet || ""),
      data.knowledgeGraph?.description || "",
      data.knowledgeGraph?.website || "",
    ].join(" ");

    const matches = snippets.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (matches && matches.length > 0) {
      const falsePositives = [
        "sentry.io", "wix.com", "wordpress.com", "example.com",
        "email@address.com", "yourname@", "support@wix", "info@wix"
      ];
      const filtered = matches.filter((m) => {
        const lower = m.toLowerCase();
        return !falsePositives.some((fp) => lower.includes(fp));
      });
      return filtered[0] || undefined;
    }
  } catch (err) {
    console.warn(`Email search error for ${name}:`, err.message);
  }
  return undefined;
};

export const searchGoogleMapsLeadsBackend = async (params) => {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("Serper API key is not configured on the server");
  }

  let { query, ll, page, hl, gl, location } = params;

  if (page && page > 1 && !ll && location) {
    const coords = await geocodeLocation(location, apiKey);
    if (coords) {
      ll = coords;
      location = undefined;
    } else {
      throw new Error(`Pagination on Google Maps requires coordinates. Try a more specific location name.`);
    }
  }

  const body = { q: query };
  if (ll) body.ll = ll;
  if (typeof page === "number") body.page = page;
  if (hl) body.hl = hl;
  if (gl) body.gl = gl;
  if (location) body.location = location;

  const res = await fetch("https://google.serper.dev/maps", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Serper Maps API error (${res.status})`);
  }

  const data = await res.json();
  const places =
    data.places ||
    data.localResults ||
    data.local_results ||
    data.results ||
    [];

  const results = places.map((place, index) => {
    const ratingNumber = toNumberField(place.rating ?? place.stars ?? place.score);
    const reviewCount = toNumberField(
      place.reviewsCount ?? place.reviews_count ?? place.user_ratings_total ?? place.reviews_total
    );
    const openingHours =
      place.openingHours ?? place.open_state ?? place.hours ?? place.operating_hours_text;
    const openingHoursString = Array.isArray(openingHours) ? openingHours.join(", ") : openingHours || undefined;

    const emailValue = place.email ?? place.contactEmail ?? place.contact_email;
    const address = place.address ?? place.formattedAddress ?? place.formatted_address;
    const phone = place.phoneNumber ?? place.phone ?? place.phone_number;
    const name = place.title ?? place.name ?? "";
    const categoryValue = place.category ?? place.type ?? place.primaryType ?? place.primary_type;
    const website = place.website;
    const id = place.placeId ?? place.place_id ?? place.cid ?? place.guid ?? String(index);
    const normalizedCategory = normalizeCategory(categoryValue, query, name);
    const reviews = extractReviewTexts(place);
    const { score, opportunityLabel, tags } = computeLeadScore(website, ratingNumber, reviewCount);

    return {
      id: String(id),
      name,
      category: categoryValue,
      normalizedCategory,
      address,
      city: extractCity(address),
      phone,
      website,
      rating: ratingNumber,
      reviewCount,
      reviews,
      openingHours: openingHoursString,
      email: emailValue,
      leadScore: score,
      opportunityLabel,
      tags,
    };
  });

  // Concurrently find missing emails using website crawler + Google search
  const enrichedResults = await Promise.all(
    results.map(async (lead) => {
      if (lead.email) return lead;
      if (lead.website) {
        // Fast direct website scrape
        try {
          const siteEmails = await findEmailsOnWebsite(lead.website, 4000);
          if (siteEmails.length > 0) {
            return { ...lead, email: siteEmails[0] };
          }
        } catch {}
      }
      // Fallback search
      const foundEmail = await searchSerperEmail(lead.name, lead.website, lead.address, apiKey);
      if (foundEmail) {
        return { ...lead, email: foundEmail };
      }
      return lead;
    })
  );

  return enrichedResults.sort((a, b) => {
    const priorityA = a.website ? 0 : 1;
    const priorityB = b.website ? 0 : 1;
    if (priorityA !== priorityB) return priorityB - priorityA;
    return b.leadScore - a.leadScore;
  });
};
