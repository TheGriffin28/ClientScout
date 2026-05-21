import axios from "axios";

export interface MapsLeadResult {
  id: string;
  name: string;
  category?: string;
  normalizedCategory?: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  reviews: string[];
  openingHours?: string;
  email?: string;
  leadScore: number;
  opportunityLabel: "High Conversion Potential" | "Medium Potential" | "Low Potential";
  tags: string[];
}

export interface MapsSearchParams {
  query: string;
  ll?: string;
  page?: number;
  hl?: string;
  gl?: string;
  location?: string;
}

type RawPlace = {
  [key: string]: unknown;
};

interface SerperMapsResponse {
  places?: RawPlace[];
  localResults?: RawPlace[];
  local_results?: RawPlace[];
  results?: RawPlace[];
  searchParameters?: {
    ll?: string;
    [key: string]: unknown;
  };
}

const rawSerperKey = import.meta.env.VITE_SERPER_API_KEY;
const SERPER_API_KEY = rawSerperKey ? String(rawSerperKey).trim() : "";

const normalizeCategory = (rawCategory: string | undefined, query: string, name: string): string => {
  const source = `${rawCategory || ""} ${query || ""} ${name || ""}`.toLowerCase();
  if (source.includes("salon") || source.includes("hair") || source.includes("spa")) return "Salon";
  if (source.includes("dent") || source.includes("clinic") || source.includes("orthodont")) return "Dentist";
  if (source.includes("gym") || source.includes("fitness") || source.includes("yoga")) return "Gym";
  if (source.includes("cafe") || source.includes("coffee") || source.includes("restaurant") || source.includes("food")) return "Cafe";
  if (source.includes("real estate") || source.includes("property")) return "Real Estate";
  if (source.includes("doctor") || source.includes("hospital")) return "Healthcare";
  if (rawCategory && rawCategory.trim()) return rawCategory.trim();
  return "Local Business";
};

const extractCity = (address?: string): string | undefined => {
  if (!address) return undefined;
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return parts[0];
  return parts[parts.length - 2];
};

const cleanReviewText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
};

const toStringField = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

const toNumberField = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toStringArrayField = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item : undefined))
      .filter((item): item is string => Boolean(item));
    return items.length > 0 ? items : undefined;
  }
  return undefined;
};

const extractReviewTexts = (place: RawPlace): string[] => {
  const reviewBlocks = place.reviews;
  const output: string[] = [];
  if (Array.isArray(reviewBlocks)) {
    reviewBlocks.forEach((review) => {
      if (typeof review === "string") {
        output.push(review);
      } else if (review && typeof review === "object") {
        const maybeText = (review as Record<string, unknown>).text ?? (review as Record<string, unknown>).snippet;
        if (typeof maybeText === "string") output.push(maybeText);
      }
    });
  }
  const snippets = toStringArrayField(place.reviewSnippets ?? place.review_snippets);
  if (snippets) output.push(...snippets);
  const cleaned = output
    .map(cleanReviewText)
    .filter((text) => text.length >= 20);
  return [...new Set(cleaned)].slice(0, 5);
};

const computeLeadScore = (
  website: string | undefined,
  rating: number | undefined,
  reviewCount: number | undefined
): {
  score: number;
  opportunityLabel: "High Conversion Potential" | "Medium Potential" | "Low Potential";
  tags: string[];
} => {
  let score = 0;
  if (!website || !website.trim()) score += 5;
  if (rating === undefined) score += 1;
  else if (rating < 4) score += 2;
  else if (rating < 4.4) score += 1;

  if (reviewCount === undefined) score += 1;
  else if (reviewCount <= 20) score += 2;
  else if (reviewCount <= 80) score += 1;

  const opportunityLabel =
    score >= 7 ? "High Conversion Potential" : score >= 4 ? "Medium Potential" : "Low Potential";

  const tags: string[] = [];
  if (!website || !website.trim()) tags.push("No Website");
  if (score >= 7) tags.push("High Opportunity");
  return { score, opportunityLabel, tags };
};

const searchEmailForLead = async (
  name: string,
  website?: string,
  address?: string
): Promise<string | undefined> => {
  if (!SERPER_API_KEY) return undefined;

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

    const response = await axios.post("https://google.serper.dev/search", {
      q: query,
      num: 3
    }, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    const data = response.data;
    const snippets = [
      ...(data.organic || []).map((res: { snippet?: string }) => res.snippet || ""),
      data.knowledgeGraph?.description || "",
      data.knowledgeGraph?.website || "",
    ].join(" ");

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = snippets.match(emailRegex);

    if (matches && matches.length > 0) {
      const commonFalsePositives = ["sentry.io", "wix.com", "wordpress.com", "example.com", "email@address.com", "yourname@", "support@wix", "info@wix"];
      const filtered = matches.filter(
        (email) => {
          const lower = email.toLowerCase();
          return !commonFalsePositives.some((fp) => lower.includes(fp));
        }
      );
      const uniqueEmails = [...new Set(filtered)];
      return uniqueEmails.length > 0 ? uniqueEmails[0] : undefined;
    }
  } catch (error) {
    console.error("Error searching for email for", name, ":", error);
  }
  return undefined;
};

const geocodeLocation = async (location: string): Promise<string | undefined> => {
  if (!SERPER_API_KEY) return undefined;
  try {
    const response = await axios.post("https://google.serper.dev/search", {
      q: location
    }, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    const data = response.data;
    if (data.knowledgeGraph?.latitude && data.knowledgeGraph?.longitude) {
      return `@${data.knowledgeGraph.latitude},${data.knowledgeGraph.longitude},13z`;
    }

    const place = (data.places && data.places[0]) ||
                  (data.localResults && data.localResults[0]) ||
                  (data.local_results && data.local_results[0]);

    if (place && (place.latitude || place.lat) && (place.longitude || place.lng)) {
      const lat = place.latitude || place.lat;
      const lng = place.longitude || place.lng;
      return `@${lat},${lng},13z`;
    }

    return undefined;
  } catch (error) {
    console.error("Geocoding failed for", location, ":", error);
    return undefined;
  }
};

export const searchGoogleMapsLeads = async (
  params: MapsSearchParams
): Promise<MapsLeadResult[]> => {
  if (!SERPER_API_KEY) {
    throw new Error("Serper API key is not configured");
  }

  let { query, ll, page, hl, gl, location } = params;

  if (page && page > 1 && !ll && location) {
    const coords = await geocodeLocation(location);
    if (coords) {
      ll = coords;
      location = undefined;
    } else {
      throw new Error(`Pagination on Google Maps requires GPS coordinates. We tried to find coordinates for "${location}" but failed. Please try a more specific location name or use the advanced search to provide coordinates (ll) manually.`);
    }
  }

  const body: Record<string, unknown> = { q: query };
  if (ll) body.ll = ll;
  if (typeof page === "number") body.page = page;
  if (hl) body.hl = hl;
  if (gl) body.gl = gl;
  if (location) body.location = location;

  let data: SerperMapsResponse;
  try {
    const response = await axios.post("https://google.serper.dev/maps", body, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });
    data = response.data as SerperMapsResponse;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data as unknown;
      const message =
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData &&
        typeof (responseData as { message: unknown }).message === "string"
          ? (responseData as { message: string }).message
          : undefined;

      if (message) {
        throw new Error(`Maps API error (${error.response.status}): ${message}`);
      }

      throw new Error(`Maps API error (${error.response.status}). Check your Serper plan and parameters.`);
    }
    throw error;
  }

  const placesArray: RawPlace[] =
    (Array.isArray(data.places) && data.places) ||
    (Array.isArray(data.localResults) && data.localResults) ||
    (Array.isArray(data.local_results) && data.local_results) ||
    (Array.isArray(data.results) && data.results) ||
    [];

  const results: MapsLeadResult[] = placesArray.map(
    (place: RawPlace, index: number) => {
      const rawRating = place.rating ?? place.stars ?? place.score;
      const ratingNumber = toNumberField(rawRating);
      const reviewCount = toNumberField(
        place.reviewsCount ??
        place.reviews_count ??
        place.user_ratings_total ??
        place.reviews_total
      );
      const openingHoursValue =
        place.openingHours ??
        place.open_state ??
        place.hours ??
        place.operating_hours_text;

      const openingHoursString =
        toStringField(openingHoursValue) ??
        (() => {
          const items = toStringArrayField(openingHoursValue);
          return items ? items.join(", ") : undefined;
        })();

      const emailValue = place.email ?? place.contactEmail ?? place.contact_email;
      const addressValue = place.address ?? place.formattedAddress ?? place.formatted_address;
      const phoneValue = place.phoneNumber ?? place.phone ?? place.phone_number;
      const nameValue = place.title ?? place.name;
      const categoryValue = toStringField(
        place.category ?? place.type ?? place.primaryType ?? place.primary_type
      );
      const website = toStringField(place.website);
      const idValue = place.placeId ?? place.place_id ?? place.cid ?? place.guid ?? String(index);
      const name = toStringField(nameValue) ?? "";
      const normalizedCategory = normalizeCategory(categoryValue, query, name);
      const reviews = extractReviewTexts(place);
      const { score, opportunityLabel, tags } = computeLeadScore(website, ratingNumber, reviewCount);

      return {
        id: String(idValue),
        name,
        category: categoryValue,
        normalizedCategory,
        address: toStringField(addressValue),
        city: extractCity(toStringField(addressValue)),
        phone: toStringField(phoneValue),
        website,
        rating: ratingNumber,
        reviewCount,
        reviews,
        openingHours: openingHoursString,
        email: toStringField(emailValue),
        leadScore: score,
        opportunityLabel,
        tags,
      };
    }
  );

  const enrichedResults = await Promise.all(
    results.map(async (result) => {
      if (!result.email && (result.website || result.name)) {
        const foundEmail = await searchEmailForLead(result.name, result.website, result.address);
        if (foundEmail) {
          return { ...result, email: foundEmail };
        }
      }
      return result;
    })
  );

  return [...enrichedResults].sort((a, b) => {
    const websitePriorityA = a.website ? 0 : 1;
    const websitePriorityB = b.website ? 0 : 1;
    if (websitePriorityA !== websitePriorityB) return websitePriorityB - websitePriorityA;
    return b.leadScore - a.leadScore;
  });
};
