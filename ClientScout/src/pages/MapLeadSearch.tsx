import { useEffect, useState } from "react";
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
  FaExternalLinkAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import api from "../services/api";
import { useUser } from "../context/UserContext";

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
      flags.push("Free website builder domain");
    }
    if (url.protocol === "http:") {
      flags.push("No HTTPS (http)");
    }
    return flags;
  } catch {
    return ["Invalid or unusual website URL"];
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
  const [activeTab, setActiveTab] = useState<"search" | "recent">("search");
  const [hideWithWebsite, setHideWithWebsite] = useState(false);
  const [mapUsageLoading, setMapUsageLoading] = useState(false);
  const [lastMapUsage, setLastMapUsage] = useState<{
    usedToday: number;
    limit: number | null;
    remaining: number | null;
  } | null>(null);

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
  const filteredResults = hideWithWebsite
    ? results.filter((item) => !item.website)
    : results;
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
      setMapUsageLoading(true);
      try {
        const usageResponse = await api.post("/leads/maps/track-search");
        const data = usageResponse.data as {
          usedToday: number;
          limit: number | null;
          remaining: number | null;
        };
        setLastMapUsage(data);
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
      } finally {
        setMapUsageLoading(false);
      }

      setSearchState("loading");
      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: location.trim() || undefined,
        ll: ll.trim() || undefined,
        page,
        hl: "en",
        gl: "in",
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
    setPage((prev) => prev + 1);
    try {
      setSearchState("loading");
      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: location.trim() || undefined,
        ll: ll.trim() || undefined,
        page: page + 1,
        hl: "en",
        gl: "in",
      });
      setResults(leads);
      setSearchState("loaded");
      updateHistory(query, location, ll, page + 1, leads);
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
      const leads = await searchGoogleMapsLeads({
        query: query.trim(),
        location: location.trim() || undefined,
        ll: ll.trim() || undefined,
        page: newPage,
        hl: "en",
        gl: "in",
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

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 dark:from-[#020617] dark:via-[#020617] dark:to-slate-900 dark:border-primary/30">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Turn Google Maps into qualified leads
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search for businesses on Google Maps, review them here, and create ClientScout leads in one click.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
              <FaSearch className="h-3 w-3" />
              Live Maps search
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              <FaGlobe className="h-3 w-3" />
              One-click lead creation
            </span>
          </div>
        {(user || lastMapUsage) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-slate-700">
              {mapUsageLoading ? (
                "Checking Maps quota..."
              ) : (
                <>
                  {(() => {
                    const used =
                      (lastMapUsage && lastMapUsage.usedToday) ??
                      (typeof user?.mapSearchCount === "number" ? user.mapSearchCount : 0);
                    const limit =
                      (lastMapUsage && lastMapUsage.limit !== null && lastMapUsage.limit) ??
                      (typeof user?.maxDailyMapSearchesPerUser === "number"
                        ? user.maxDailyMapSearchesPerUser
                        : null);
                    if (!limit || limit <= 0) {
                      return `Maps searches today: ${used}`;
                    }
                    const remaining = limit - used;
                    return `Maps searches today: ${used} / ${limit}${
                      remaining >= 0 ? ` (remaining: ${remaining})` : ""
                    }`;
                  })()}
                </>
              )}
            </span>
          </div>
        )}
        </div>
        {hasSearched && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            {query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-slate-700">
                <FaSearch className="h-3 w-3 text-blue-500" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {query}
                </span>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-slate-700">
                <FaMapMarkerAlt className="h-3 w-3 text-rose-500" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {location}
                </span>
              </span>
            )}
            {!location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-slate-700">
                <FaMapMarkerAlt className="h-3 w-3 text-amber-500" />
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  Global search
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-white/[0.03]">
            <div className="border-b border-stroke px-6.5 pt-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Search Google Maps
              </h3>
              <div className="mt-4 inline-flex rounded-full bg-gray-100 p-1 text-xs dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setActiveTab("search")}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    activeTab === "search"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-slate-800 dark:text-gray-100"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("recent")}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    activeTab === "recent"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-slate-800 dark:text-gray-100"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  Recent searches
                </button>
              </div>
            </div>

            {activeTab === "search" ? (
              <form onSubmit={handleSearch}>
                <div className="p-6.5 space-y-5">
                  <div className="space-y-4">
                    <div className="md:flex-1">
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        What are you searching for?
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <FaSearch className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Dental clinic"
                          className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/70 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:focus:ring-primary/60"
                        />
                      </div>
                    </div>

                    <div className="md:flex-1">
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Location
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <FaMapMarkerAlt className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Mumbai, Andheri East"
                          className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/70 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:focus:ring-primary/60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Focus searches on Indian cities and areas using the location field.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((prev) => !prev)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showAdvanced ? "Hide advanced" : "Show advanced"}
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-3 dark:border-slate-700">
                      <div>
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                          Coordinates (ll)
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <FaGlobe className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={ll}
                            onChange={(e) => setLl(e.target.value)}
                            placeholder="@23.233247,77.416724,13z"
                            className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/70 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:focus:ring-primary/60"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Leave blank for city-wide searches, or paste the ll value from a Google Maps URL for a very specific area.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={searchState === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {searchState === "loading" ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <FaSearch className="h-4 w-4" />
                        <span>Search Maps</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6.5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Recent searches
                  </p>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Run a search to see it here. Loading a recent search will not use any Serper credits.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {history.map((item, index) => (
                      <button
                        key={`${item.query}-${item.location || ""}-${item.ll || ""}-${index}`}
                        type="button"
                        onClick={() => handleApplyHistoryItem(item)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-800 shadow-sm transition hover:border-primary/60 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-100 dark:hover:border-primary/60 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                              <FaSearch className="h-3 w-3" />
                            </span>
                            <div>
                              <p className="max-w-[200px] truncate text-[11px] font-semibold">
                                {item.query}
                              </p>
                              <p className="max-w-[200px] truncate text-[11px] text-gray-500 dark:text-gray-400">
                                {item.location || "No location"} · Page{" "}
                                {item.page && item.page > 0 ? item.page : 1}
                              </p>
                            </div>
                          </div>
                          {item.results && item.results.length > 0 && (
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              {item.results.length} result
                              {item.results.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-white/[0.03]">
            <div className="border-b border-stroke py-4 px-6.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between dark:border-strokedark">
              <div>
                <h3 className="font-medium text-black dark:text-white">
                  Search Results
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Review businesses from Google Maps and add only the ones worth contacting.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 cursor-pointer dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={hideWithWebsite}
                    onChange={(e) => setHideWithWebsite(e.target.checked)}
                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                  <span className="font-medium">
                    Hide businesses that already have a website
                  </span>
                </label>
                {hasSearched && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 dark:bg-slate-800 dark:text-gray-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {totalResults} result{totalResults === 1 ? "" : "s"}
                  </span>
                )}
                <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-slate-700">
                  Page {page}
                </span>
              </div>
            </div>

            {searchState === "loading" ? (
              <div className="p-6">
                <TableSkeleton rows={6} cols={4} />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchState === "idle"
                  ? "Search Google Maps to see businesses here."
                  : results.length > 0 && hideWithWebsite
                  ? "All results for this search currently have a website. Turn off the filter to see them."
                  : "No results found for this search."}
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-3">
                  {filteredResults.map((item) => {
                    const weakFlags = getWeakWebsiteFlags(item.website);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm ring-1 ring-transparent transition hover:border-primary/40 hover:shadow-md hover:ring-primary/10 dark:border-strokedark dark:bg-white/[0.02]"
                      >
                        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.name || "Unnamed place"}
                              </h4>
                              {item.rating && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                                  <FaStar className="h-3 w-3" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            {item.address && (
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                {item.address}
                              </p>
                            )}
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              {item.phone && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 dark:bg-slate-800">
                                  <FaPhoneAlt className="h-3 w-3" />
                                  <span>{item.phone}</span>
                                </span>
                              )}
                              {item.website && (
                                <>
                                  <a
                                    href={item.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200"
                                  >
                                    <FaExternalLinkAlt className="h-3 w-3" />
                                    <span>Website</span>
                                  </a>
                                  {weakFlags.length > 0 && (
                                    <span className="inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                                      {weakFlags.join(" • ")}
                                    </span>
                                  )}
                                </>
                              )}
                              {item.openingHours && (
                                <span className="inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                  {item.openingHours}
                                </span>
                              )}
                              {item.email && (
                                <span className="inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-purple-50 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                                  <FaEnvelope className="h-3 w-3" />
                                  <span>{item.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 md:mt-0 md:flex-col md:items-end">
                            <button
                              type="button"
                              onClick={() => handleCreateLead(item)}
                              disabled={creatingLeadId === item.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              {creatingLeadId === item.id
                                ? "Creating..."
                                : "Create Lead"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={!canGoToPreviousPage}
                    className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                  >
                    Previous page
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!canGoToNextPage}
                    className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                  >
                    Next page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
