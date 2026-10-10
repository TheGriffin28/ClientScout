import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaUser, FaChevronRight, FaClock, FaExclamationCircle } from "react-icons/fa";
import { getFollowUps, updateLead, Lead } from "../services/leadService";
import { TableSkeleton } from "../components/ui/Skeleton";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";

interface FollowUpItem extends Lead {
  statusLabel: "Overdue" | "Today" | "Upcoming";
}

const FollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Overdue" | "Today" | "Upcoming">("All");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchFollowUps(searchQuery);
  }, [searchQuery]);

  const fetchFollowUps = async (search = "") => {
    try {
      setLoading(true);
      const leads = await getFollowUps(search);
      
      // Calculate status for each follow-up
      const followUpsWithStatus = leads.map((lead) => {
        const followUpDate = new Date(lead.nextFollowUp!);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        followUpDate.setHours(0, 0, 0, 0);
        
        const diffTime = followUpDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let statusLabel: "Overdue" | "Today" | "Upcoming";
        if (diffDays < 0) {
          statusLabel = "Overdue";
        } else if (diffDays === 0) {
          statusLabel = "Today";
        } else {
          statusLabel = "Upcoming";
        }
        
        return {
          ...lead,
          statusLabel,
        };
      });
      
      // Sort by date (overdue first, then today, then upcoming)
      followUpsWithStatus.sort((a, b) => {
        if (a.statusLabel === "Overdue" && b.statusLabel !== "Overdue") return -1;
        if (a.statusLabel !== "Overdue" && b.statusLabel === "Overdue") return 1;
        if (a.statusLabel === "Today" && b.statusLabel === "Upcoming") return -1;
        if (a.statusLabel === "Upcoming" && b.statusLabel === "Today") return 1;
        
        const dateA = new Date(a.nextFollowUp!).getTime();
        const dateB = new Date(b.nextFollowUp!).getTime();
        return dateA - dateB;
      });
      
      setFollowUps(followUpsWithStatus);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    return {
      All: followUps.length,
      Overdue: followUps.filter(f => f.statusLabel === "Overdue").length,
      Today: followUps.filter(f => f.statusLabel === "Today").length,
      Upcoming: followUps.filter(f => f.statusLabel === "Upcoming").length
    };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    if (activeTab === "All") return followUps;
    return followUps.filter(f => f.statusLabel === activeTab);
  }, [followUps, activeTab]);

  const handleMarkContacted = async (leadId: string) => {
    try {
      await updateLead(leadId, { status: "Contacted", nextFollowUp: "" });
      // Remove the follow-up from the list since it's been contacted
      setFollowUps((prev) => prev.filter((lead) => lead._id !== leadId));
      toast.success("Lead marked as contacted!");
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to mark as contacted. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(date);
    dDate.setHours(0, 0, 0, 0);

    if (dDate.getTime() === today.getTime()) return "Today";
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dDate.getTime() === tomorrow.getTime()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          Follow-ups
        </h1>
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse dark:bg-white/[0.03]"></div>
          ))}
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-white/[0.03]">
          <TableSkeleton rows={8} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Follow-ups
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your scheduled outreach and stay on top of leads.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => setActiveTab("All")}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${activeTab === "All" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20" : "border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-white/[0.03]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <FaCalendarAlt size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{counts.All}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("Overdue")}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${activeTab === "Overdue" ? "border-red-500 bg-red-50 ring-1 ring-red-500 dark:bg-red-900/20" : "border-gray-200 bg-white hover:border-red-300 dark:border-gray-700 dark:bg-white/[0.03]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              <FaExclamationCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{counts.Overdue}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("Today")}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${activeTab === "Today" ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500 dark:bg-orange-900/20" : "border-gray-200 bg-white hover:border-orange-300 dark:border-gray-700 dark:bg-white/[0.03]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{counts.Today}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("Upcoming")}
          className={`cursor-pointer rounded-xl border p-5 transition-all ${activeTab === "Upcoming" ? "border-green-500 bg-green-50 ring-1 ring-green-500 dark:bg-green-900/20" : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-white/[0.03]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
              <FaChevronRight size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{counts.Upcoming}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        {(["All", "Overdue", "Today", "Upcoming"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
        ))}
      </div>

      {/* Follow-up List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredFollowUps.length > 0 ? (
          filteredFollowUps.map((item) => (
            <div
              key={item._id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <FaUser size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">
                      {item.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.contactName || "No contact name"}
                    </p>
                  </div>
                </div>
                <Badge
                  color={
                    item.statusLabel === "Overdue"
                      ? "error"
                      : item.statusLabel === "Today"
                      ? "warning"
                      : "success"
                  }
                  variant="light"
                  size="sm"
                >
                  {item.statusLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{formatDate(item.nextFollowUp!)}</span>
                </div>
                {item.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaPhoneAlt className="text-gray-400" />
                    <span className="line-clamp-1">{item.phone}</span>
                  </div>
                )}
                {item.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaEnvelope className="text-gray-400" />
                    <span className="line-clamp-1 truncate max-w-[150px]">{item.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
                <button
                  onClick={() => navigate(`/leads/${item._id}`)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  View Detail <FaChevronRight size={10} />
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkContacted(item._id)}
                    startIcon={<FaCheckCircle size={14} />}
                  >
                    Mark Contacted
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5">
              <FaCalendarAlt size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">No follow-ups found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No follow-ups matching "${searchQuery}" in ${activeTab} category.` 
                : `You don't have any ${activeTab !== "All" ? activeTab.toLowerCase() : ""} follow-ups scheduled.`}
            </p>
            {activeTab !== "All" && (
              <button 
                onClick={() => setActiveTab("All")}
                className="mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUps;
