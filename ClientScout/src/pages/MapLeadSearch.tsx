import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { createLead, LeadFormData, Lead } from "../services/leadService";
import {
  MapsLeadResult,
  searchGoogleMapsLeads,
} from "../services/mapsLeadSearchService";
import { TableSkeleton } from "../components/ui/Skeleton";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaGlobe,
  FaStar,
  FaPhoneAlt,
  FaHistory,
  FaFilter,
  FaPlus,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaClock,
} from "react-icons/fa";
import api from "../services/api";
import { useUser } from "../context/UserContext";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";

type SearchState = "idle" | "loading" | "loaded" | "error";

type SearchHistoryItem = {
  query: string;
  location?: string;
  ll?: string;
  page: number;
  results: MapsLeadResult[];
};

const MAPS_HISTORY_KEY = "clientScout_maps_search_history";
const MAPS_HISTORY_LIMIT = 10;

const getWeakWebsiteFlags = (website?: string): string[] => {
  if (!website) {
    return [];
  }
  let normalized = website.trim();
  if (!normalized) {
    return [];
  }
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }
  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    const flags: string[] = [];
    const freeBuilderHosts = [
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
    ];
    if (
      host === "sites.google.com" ||
      host.endsWith(".business.site") ||
      freeBuilderHosts.some(
        (pattern) => host === pattern || host.endsWith(`.${pattern}`)
      )
    ) {
      flags.push("Free Builder");
    }
    if (url.protocol === "http:") {
      flags.push("Insecure (HTTP)");
    }
    return flags;
  } catch {
    return ["Invalid URL"];
  }
};

export default function MapLeadSearch() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [ll, setLl] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<MapsLeadResult[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [creatingLeadId, setCreatingLeadId] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [hideWithWebsite, setHideWithWebsite] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MAPS_HISTORY_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return;
      }
      const validItems: SearchHistoryItem[] = parsed
        .filter(
          (item: unknown) =>
            item &&
            typeof item === "object" &&
            "query" in item &&
            typeof (item as { query: unknown }).query === "string"
        )
        .map((item: unknown) => {
          const typed = item as {
            query: string;
            location?: string;
            ll?: string;
            page?: number;
            results?: MapsLeadResult[];
          };
          const pageValue =
            typeof typed.page === "number" && Number.isFinite(typed.page)
              ? typed.page
              : 1;
          const resultsArray = Array.isArray(typed.results)
            ? typed.results
            : [];
          return {
            query: typed.query,
            location: typed.location,
            ll: typed.ll,
            page: pageValue,
            results: resultsArray,
          };
        })
        .slice(0, MAPS_HISTORY_LIMIT);
      setHistory(validItems);
    } catch {
      localStorage.removeItem(MAPS_HISTORY_KEY);
    }
  }, []);

  const hasSearched = searchState !== "idle" || results.length > 0;
  
  const filteredResults = useMemo(() => {
    return hideWithWebsite
      ? results.filter((item) => !item.website)
      : results;
  }, [results, hideWithWebsite]);

  const totalResults = filteredResults.length;

  const updateHistory = (
    nextQuery: string,
    nextLocation: string,
    nextLl: string,
    nextPage: number,
    nextResults: MapsLeadResult[]
  ) => {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) {
      return;
    }
    const normalizedLocation = nextLocation.trim();
    const normalizedLl = nextLl.trim();
    const safePage = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
    const newItem: SearchHistoryItem = {
      query: trimmedQuery,
      location: normalizedLocation || undefined,
      ll: normalizedLl || undefined,
      page: safePage,
      results: Array.isArray(nextResults) ? nextResults : [],
    };
    const filtered = history.filter(
      (item) =>
        item.query !== newItem.query ||
        (item.location || "") !== (newItem.location || "") ||
        (item.ll || "") !== (newItem.ll || "")
    );
    const nextHistory = [newItem, ...filtered].slice(0, MAPS_HISTORY_LIMIT);
    setHistory(nextHistory);
    try {
      localStorage.setItem(MAPS_HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {
      console.error("Failed to save maps search history");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Enter a search term");
      return;
    }

    try {
      try {
        const usageResponse = await api.post("/leads/maps/track-search");
        const data = usageResponse.data as {
          usedToday: number;
          limit: number | null;
          remaining: number | null;
        };
        if (user) {
          const limit = typeof user.maxDailyMapSearchesPerUser === "number" ? user.maxDailyMapSearchesPerUser : undefined;
          const updatedUser = {
            ...user,
            mapSearchCount: data.usedToday,
            lastMapSearchAt: new Date().toISOString(),
            maxDailyMapSearchesPerUser: limit,
          };
          setUser(updatedUser);
        }
      } catch (usageError: unknown) {
        if (
          usageError &&
          typeof usageError === "object" &&
          "response" in usageError &&
          usageError.response &&
          typeof usageError.response === "object" &&
          usageError.response &&
          "status" in usageError.response &&
          typeof usageError.response.status === "number" &&
          usageError.response.status === 403 &&
          "data" in usageError.response &&
          usageError.response.data &&
          typeof usageError.response.data === "object" &&
          "message" in usageError.response.data &&
          typeof usageError.response.data.message === "string"
        ) {
          const message = usageError.response.data.message;
          toast.error(message);
          setSearchState("idle");
          return;
        }
      }

      setSearchState("loading");
      let searchLocation: string | undefined = location.trim();
      let searchLl: string | undefined = ll.trim();

      if (searchLocation.toLowerCase() === "mumbai") {
        searchLl = "@19.0728,72.8826,14z";
        searchLocation = undefined;
      } else if (searchLocation) {
        searchLocation = `${searchLocation}, India`;
      }

      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: searchLocation,
        ll: searchLl || undefined,
        page,
        hl: "en",
      });
      setResults(leads);
      setSearchState("loaded");
      updateHistory(query, location, ll, page, leads);
    } catch (error: unknown) {
      setSearchState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Failed to search Google Maps leads. Try again.";
      toast.error(message);
    }
  };

  const handleCreateLead = async (item: MapsLeadResult) => {
    if (!item.name) {
      toast.error("This result does not have a business name");
      return;
    }

    try {
      setCreatingLeadId(item.id);

      const payload: LeadFormData = {
        businessName: item.name,
        contactName: undefined,
        email: item.email,
        phone: item.phone,
        website: item.website,
        industry: undefined,
        businessType: undefined,
        websiteObservations: undefined,
        painPoints: undefined,
        aiSummary: undefined,
        leadScore: undefined,
        leadScoreReason: undefined,
        aiGeneratedAt: undefined,
        source: "Google Maps",
        status: "New",
        notes: item.address,
        nextFollowUp: "",
        emailDraft: undefined,
        whatsappDraft: undefined,
      };

      const created: Lead = await createLead(payload);

      toast.success("Lead created from Google Maps");
      navigate(`/leads/${created._id}`);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to create lead from this result.";
      toast.error(message);
    } finally {
      setCreatingLeadId(null);
    }
  };

  const canGoToNextPage = results.length > 0;
  const canGoToPreviousPage = page > 1;

  const handleNextPage = async () => {
    if (!canGoToNextPage) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    try {
      setSearchState("loading");
      let searchLocation: string | undefined = location.trim();
      let searchLl: string | undefined = ll.trim();

      if (searchLocation.toLowerCase() === "mumbai") {
        searchLl = "@19.0728,72.8826,14z";
        searchLocation = undefined;
      } else if (searchLocation) {
        searchLocation = `${searchLocation}, India`;
      }

      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: searchLocation,
        ll: searchLl || undefined,
        page: nextPage,
        hl: "en",
      });
      setResults(leads);
      setSearchState("loaded");
      updateHistory(query, location, ll, nextPage, leads);
    } catch (error: unknown) {
      setSearchState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load next page of results.";
      toast.error(message);
    }
  };

  const handlePreviousPage = async () => {
    if (!canGoToPreviousPage) {
      return;
    }
    const newPage = page - 1;
    setPage(newPage);
    try {
      setSearchState("loading");
      let searchLocation: string | undefined = location.trim();
      let searchLl: string | undefined = ll.trim();

      if (searchLocation.toLowerCase() === "mumbai") {
        searchLl = "@19.0728,72.8826,14z";
        searchLocation = undefined;
      } else if (searchLocation) {
        searchLocation = `${searchLocation}, India`;
      }

      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: searchLocation,
        ll: searchLl || undefined,
        page: newPage,
        hl: "en",
      });
      setResults(leads);
      setSearchState("loaded");
      updateHistory(query, location, ll, newPage, leads);
    } catch (error: unknown) {
      setSearchState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load previous page of results.";
      toast.error(message);
    }
  };

  const handleApplyHistoryItem = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setLocation(item.location || "");
    setLl(item.ll || "");
    const pageValue = item.page && item.page > 0 ? item.page : 1;
    setPage(pageValue);
    if (item.results && Array.isArray(item.results) && item.results.length > 0) {
      setResults(item.results);
      setSearchState("loaded");
    } else {
      setResults([]);
      setSearchState("idle");
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(MAPS_HISTORY_KEY);
  };

  return (
    <>
      <PageMeta
        title="Google Maps Lead Search | ClientScout"
        description="Search Google Maps for businesses and convert them into leads inside ClientScout."
      />
      <PageBreadcrumb pageTitle="Google Maps Lead Search" />

      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gray-900 px-6 py-10 shadow-2xl lg:px-12 lg:py-16">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-900/20" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Discover Local Businesses on Google Maps
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Find potential clients in any area and turn them into qualified leads with just one click.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Badge color="info" variant="solid" size="md" startIcon={<FaSearch size={12} />}>
                  Live Search
                </Badge>
                <Badge color="success" variant="solid" size="md" startIcon={<FaCheckCircle size={12} />}>
                  One-Click Leads
                </Badge>
                {user && (
                  <Badge color="warning" variant="solid" size="md" startIcon={<FaInfoCircle size={12} />}>
                    Quota: {user.mapSearchCount || 0} / {user.maxDailyMapSearchesPerUser || 10}
                  </Badge>
                )}
              </div>

              <div className="mt-8">
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:shadow-lg ring-1 ring-white/20"
                  >
                    <FaHistory className="text-blue-400" />
                    <span>Recent Searches</span>
                    <span className="ml-1 rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                      {history.length}
                    </span>
                  </button>

                  {showHistoryDropdown && (
                    <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-white/10 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-xl z-40 ring-1 ring-white/20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FaHistory className="text-blue-400" size={12} />
                          Recent Discoveries
                        </h3>
                        {history.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearHistory();
                            }} 
                            className="text-[10px] font-semibold text-gray-400 hover:text-red-400 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {history.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-xs text-gray-500">No recent searches yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                          {history.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleApplyHistoryItem(item);
                                setShowHistoryDropdown(false);
                              }}
                              className="group w-full rounded-xl border border-white/5 bg-white/5 p-3 text-left transition-all hover:bg-white/10 hover:border-blue-500/50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                  {item.query}
                                </p>
                                <span className="text-[10px] text-gray-500">#{index + 1}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                                <FaMapMarkerAlt size={8} />
                                <span className="truncate">{item.location || "Global"}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Search Form */}
            <div className="w-full max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-md ring-1 ring-white/20">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Business Type</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <FaSearch size={14} />
                    </span>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Dental Clinic, Real Estate"
                      className="w-full rounded-xl border-none bg-white/20 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:bg-white/30 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <FaMapMarkerAlt size={14} />
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Mumbai, New York"
                      className="w-full rounded-xl border-none bg-white/20 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:bg-white/30 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={searchState === "loading"}
                    startIcon={searchState === "loading" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <FaSearch size={14} />}
                  >
                    {searchState === "loading" ? "Searching..." : "Start Discovery"}
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {showAdvanced ? "Hide" : "Show"} advanced <FaFilter size={10} />
                  </button>
                </div>

                {showAdvanced && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Coordinates (Optional)</label>
                      <input
                        type="text"
                        value={ll}
                        onChange={(e) => setLl(e.target.value)}
                        placeholder="@lat,lng,zoom"
                        className="w-full rounded-xl border-none bg-white/20 py-2 px-4 text-xs text-white placeholder-gray-500 focus:bg-white/30"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Results Area */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchState === "idle" ? "Discovery Awaits" : "Search Results"}
                </h2>
                <p className="text-sm text-gray-500">
                  {hasSearched ? `Found ${totalResults} potential leads for you.` : "Search to start finding leads."}
                </p>
              </div>

              {hasSearched && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={hideWithWebsite}
                      onChange={(e) => setHideWithWebsite(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    Hide with Website
                  </label>
                  
                  <div className="flex gap-1">
                    <button 
                      disabled={!canGoToPreviousPage}
                      onClick={handlePreviousPage}
                      className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <FaChevronLeft size={12} />
                    </button>
                    <div className="flex items-center px-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                      Page {page}
                    </div>
                    <button 
                      disabled={!canGoToNextPage}
                      onClick={handleNextPage}
                      className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {searchState === "loading" ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <TableSkeleton rows={8} cols={4} />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-20 dark:border-gray-800">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-900">
                  <FaSearch size={32} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {searchState === "idle" ? "Ready to search?" : "No results found"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchState === "idle" ? "Enter a query above to find local businesses." : "Try adjusting your search terms or location."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredResults.map((item) => {
                  const weakFlags = getWeakWebsiteFlags(item.website);
                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-xl dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-blue-500"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                            <FaBuilding size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {item.name || "Unnamed Business"}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                              <FaMapMarkerAlt size={12} className="text-red-500" />
                              <span className="truncate">{item.address || "No address provided"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {item.rating && (
                            <Badge color="warning" size="sm" startIcon={<FaStar size={10} />}>
                              {item.rating.toFixed(1)}
                            </Badge>
                          )}
                          {item.openingHours && (
                            <Badge color="success" size="sm" startIcon={<FaClock size={10} />}>
                              Open Now
                            </Badge>
                          )}
                        </div>

                        <div className="mt-6 space-y-3">
                          {item.phone && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                                <FaPhoneAlt size={12} />
                              </div>
                              <span className="font-medium">{item.phone}</span>
                            </div>
                          )}
                          {item.website && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                                <FaGlobe size={12} />
                              </div>
                              <a 
                                href={item.website} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="font-medium text-blue-600 hover:underline dark:text-blue-400 truncate max-w-[200px]"
                              >
                                {item.website.replace(/^https?:\/\//, "")}
                              </a>
                              {weakFlags.length > 0 && (
                                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  {weakFlags[0]}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.01]">
                        <Button
                          variant="primary"
                          className="w-full"
                          size="sm"
                          onClick={() => handleCreateLead(item)}
                          disabled={creatingLeadId === item.id}
                          startIcon={creatingLeadId === item.id ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <FaPlus size={12} />}
                        >
                          {creatingLeadId === item.id ? "Adding..." : "Add to CRM"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
