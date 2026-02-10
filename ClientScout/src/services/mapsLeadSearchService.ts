import axios from "axios";

export interface MapsLeadResult {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  openingHours?: string;
  email?: string;
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

const searchEmailForLead = async (
  name: string,
  website?: string,
  address?: string
): Promise<string | undefined> => {
  if (!SERPER_API_KEY) return undefined;

  try {
    // Try to find email using a focused search
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
      timeout: 5000, // 5 second timeout for email search
    });

    const data = response.data;
    const snippets = [
      ...(data.organic || []).map((res: any) => res.snippet || ""),
      data.knowledgeGraph?.description || "",
      data.knowledgeGraph?.website || "",
    ].join(" ");

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = snippets.match(emailRegex);

    if (matches && matches.length > 0) {
      // Filter out common false positives and duplicates
      const commonFalsePositives = ["sentry.io", "wix.com", "wordpress.com", "example.com", "email@address.com", "yourname@", "support@wix", "info@wix"];
      const filtered = matches.filter(
        (email) => {
          const lower = email.toLowerCase();
          return !commonFalsePositives.some((fp) => lower.includes(fp));
        }
      );
      
      // Get unique emails
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
      timeout: 10000, // 10 second timeout for geocoding
    });

    const data = response.data;
    
    // Check knowledge graph for coordinates
    if (data.knowledgeGraph?.latitude && data.knowledgeGraph?.longitude) {
      return `@${data.knowledgeGraph.latitude},${data.knowledgeGraph.longitude},13z`;
    }

    // Check places or local results
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

export const searchGoogleMapsLeads = async (
  params: MapsSearchParams
): Promise<MapsLeadResult[]> => {
  if (!SERPER_API_KEY) {
    throw new Error("Serper API key is not configured");
  }

  let { query, ll, page, hl, gl, location } = params;

  // For page > 1, Serper REQUIRES 'll' (coordinates). 
  // If we only have 'location', we must geocode it first.
  if (page && page > 1 && !ll && location) {
    const coords = await geocodeLocation(location);
    if (coords) {
      ll = coords;
      // When using ll, location parameter should often be omitted to avoid conflicts in Serper
      location = undefined; 
    } else {
      throw new Error(`Pagination on Google Maps requires GPS coordinates. We tried to find coordinates for "${location}" but failed. Please try a more specific location name or use the advanced search to provide coordinates (ll) manually.`);
    }
  }

  const body: Record<string, unknown> = {
    q: query,
  };

  if (ll) {
    body.ll = ll;
  }

  if (typeof page === "number") {
    body.page = page;
  }

  if (hl) {
    body.hl = hl;
  }

  if (gl) {
    body.gl = gl;
  }

  if (location) {
    body.location = location;
  }

  let data: SerperMapsResponse;

  try {
    const response = await axios.post("https://google.serper.dev/maps", body, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 20000, // 20 second timeout for maps search
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
        throw new Error(
          `Maps API error (${error.response.status}): ${message}`
        );
      }

      throw new Error(
        `Maps API error (${error.response.status}). Check your Serper plan and parameters.`
      );
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
      const rawRating =
        place.rating ??
        place.stars ??
        place.score;
      const ratingNumber = toNumberField(rawRating);

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

      const emailValue =
        place.email ??
        place.contactEmail ??
        place.contact_email;

      const addressValue =
        place.address ??
        place.formattedAddress ??
        place.formatted_address;

      const phoneValue =
        place.phoneNumber ??
        place.phone ??
        place.phone_number;

      const nameValue =
        place.title ??
        place.name;

      const idValue =
        place.placeId ??
        place.place_id ??
        place.cid ??
        place.guid ??
        String(index);

      return {
        id: String(idValue),
        name: toStringField(nameValue) ?? "",
        address: toStringField(addressValue),
        phone: toStringField(phoneValue),
        website: toStringField(place.website),
        rating: ratingNumber,
        openingHours: openingHoursString,
        email: toStringField(emailValue),
      };
    }
  );

  // Try to enrich results with emails if missing
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

  return enrichedResults;
};


