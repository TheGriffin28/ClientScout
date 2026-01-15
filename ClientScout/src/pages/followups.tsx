import { useState, useEffect } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { getFollowUps, updateLead, Lead } from "../services/leadService";

interface FollowUpItem extends Lead {
  statusLabel: "Overdue" | "Today" | "Upcoming";
}

const FollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const leads = await getFollowUps();
      
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

  const handleMarkContacted = async (leadId: string) => {
    try {
      await updateLead(leadId, { status: "Contacted", nextFollowUp: "" });
      // Remove the follow-up from the list since it's been contacted
      setFollowUps((prev) => prev.filter((lead) => lead._id !== leadId));
    } catch (error) {
      console.error("Error updating lead status:", error);
      alert("Failed to mark as contacted. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
          Follow-ups
        </h1>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading follow-ups...</div>
      </div>
    );
  }

  if (followUps.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
          Follow-ups
        </h1>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No follow-ups scheduled. Add a follow-up date to a lead to see it here.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
        Follow-ups
      </h1>

      {/* Follow-up List */}
      <div className="space-y-4">
        {followUps.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-md dark:bg-white/[0.03]"
            >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <FaPhoneAlt />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {item.businessName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.contactName || "No contact name"}
                </p>
              </div>
            </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Follow-up Date</p>
            <p className="font-medium text-gray-800 dark:text-white">
              {formatDate(item.nextFollowUp!)}
            </p>
          </div>

          <div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                item.statusLabel === "Overdue"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : item.statusLabel === "Today"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {item.statusLabel}
            </span>
          </div>

          <button
            onClick={() => handleMarkContacted(item._id)}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Mark Contacted
          </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUps;
