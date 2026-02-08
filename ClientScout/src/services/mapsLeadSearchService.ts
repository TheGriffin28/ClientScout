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
}

const rawSerperKey = import.meta.env.VITE_SERPER_API_KEY;
const SERPER_API_KEY = rawSerperKey ? String(rawSerperKey).trim() : "";

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

  const { query, ll, page, hl, gl, location } = params;

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
    const response = await axios.get("https://google.serper.dev/maps", {
      params: body,
      headers: {
        "X-API-KEY": SERPER_API_KEY,
      },
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

  return results;
};


