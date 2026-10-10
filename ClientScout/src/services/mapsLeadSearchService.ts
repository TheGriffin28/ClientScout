import api from "./api";

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

export interface MapsSearchResponse {
  results: MapsLeadResult[];
  usage?: {
    usedToday: number;
    limit: number;
    remaining: number;
    extraRemaining: number;
  };
}

/**
 * Searches Google Maps leads through the backend proxy.
 * Enforces user monthly limits, secures the Serper API key on the server,
 * and enriches missing emails automatically.
 */
export const searchGoogleMapsLeadsWithUsage = async (
  params: MapsSearchParams
): Promise<MapsSearchResponse> => {
  try {
    const response = await api.post<MapsSearchResponse>("/leads/maps/search", params);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to search Google Maps leads";
    throw new Error(message);
  }
};

export const searchGoogleMapsLeads = async (
  params: MapsSearchParams
): Promise<MapsLeadResult[]> => {
  const data = await searchGoogleMapsLeadsWithUsage(params);
  return data.results || [];
};
