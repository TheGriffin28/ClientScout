import { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getLeads } from "../../services/leadService";
import type { Lead } from "../../services/leadService";
import { hasEmailDraft, hasWhatsAppDraft } from "../leads/designPreviewUtils";
import {
  getNotifications as fetchDatabaseNotifications,
  getUnreadCount,
  markAsRead,
} from "../../services/notificationService";
import { FaCalendarCheck, FaCalendarTimes, FaFire, FaBrain, FaEnvelope, FaCheckCircle, FaEdit } from "react-icons/fa";
import type { Notification as DbNotification } from "../../services/notificationService";

type NotificationType =
  | 'FOLLOWUP_TODAY'
  | 'FOLLOWUP_OVERDUE'
  | 'AI_INSIGHTS'
  | 'HIGH_PRIORITY'
  | 'DRAFT_READY'
  | 'DESIGN_APPROVED'
  | 'CHANGE_REQUEST';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  priority: number;
  icon: React.ReactNode;
  color: string;
  leadId?: string;
  isRead?: boolean;
  isDatabase?: boolean;
}

function getLeadIdFromNotification(dbNotif: DbNotification): string | undefined {
  if (!dbNotif.lead) return undefined;
  if (typeof dbNotif.lead === "string") return dbNotif.lead;
  return dbNotif.lead._id;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadBadgeCount, setUnreadBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAndProcessNotifications = useCallback(async () => {
    setLoading(true);
    const newNotifications: Notification[] = [];
    const coveredLeadIds = new Set<string>();

    // 1. Database notifications (design approval, change requests)
    try {
      const dbNotifications = await fetchDatabaseNotifications(true);
      dbNotifications.forEach((dbNotif: DbNotification) => {
        const leadId = getLeadIdFromNotification(dbNotif);
        if (leadId) coveredLeadIds.add(leadId);

        const isApproval = dbNotif.type === "design_approved";
        newNotifications.push({
          id: dbNotif._id,
          type: isApproval ? "DESIGN_APPROVED" : "CHANGE_REQUEST",
          title: dbNotif.title,
          message: dbNotif.message,
          link: dbNotif.actionUrl || (leadId ? `/leads/${leadId}` : "/leads"),
          priority: isApproval ? 0 : 1,
          icon: isApproval ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <FaEdit className="text-orange-500" />
          ),
          color: isApproval ? "text-green-600" : "text-orange-600",
          leadId,
          isRead: dbNotif.isRead,
          isDatabase: true,
        });
      });
    } catch (error) {
      console.error("Error fetching database notifications:", error);
    }

    // 2. Lead-based notifications (including fallback for client approval)
    let leads: Lead[] = [];
    try {
      const data = await getLeads(1, 500, "");
      leads = Array.isArray(data) ? data : data.leads;
    } catch (error) {
      console.error("Error fetching leads for notifications:", error);
    }

    const seenDesignApprovals = JSON.parse(
      localStorage.getItem("seenDesignApprovals") || "[]"
    );
    const seenChangeRequests = JSON.parse(
      localStorage.getItem("seenChangeRequests") || "[]"
    );

    // Fallback: show client approval from lead data if no DB notification yet
    leads.forEach((lead) => {
      if (
        lead.clientApproved &&
        lead._id &&
        !coveredLeadIds.has(lead._id) &&
        !seenDesignApprovals.includes(lead._id)
      ) {
        newNotifications.push({
          id: `design-approved-${lead._id}`,
          type: "DESIGN_APPROVED",
          title: "Design Approved!",
          message: `Client approved: ${lead.clientApprovedLayoutName || lead.businessName}`,
          link: `/leads/${lead._id}`,
          priority: 0,
          icon: <FaCheckCircle className="text-green-500" />,
          color: "text-green-600",
          leadId: lead._id,
        });
        coveredLeadIds.add(lead._id);
      }

      if (
        lead.clientChangeRequest &&
        lead._id &&
        !coveredLeadIds.has(lead._id) &&
        !seenChangeRequests.includes(lead._id)
      ) {
        newNotifications.push({
          id: `change-request-${lead._id}`,
          type: "CHANGE_REQUEST",
          title: "Change Request Received",
          message: lead.clientChangeRequest,
          link: `/leads/${lead._id}`,
          priority: 1,
          icon: <FaEdit className="text-orange-500" />,
          color: "text-orange-600",
          leadId: lead._id,
        });
        coveredLeadIds.add(lead._id);
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const seenHighPriority = JSON.parse(localStorage.getItem("seenHighPriority") || "[]");
    const seenDrafts = JSON.parse(localStorage.getItem("seenDrafts") || "[]");
    const seenAIInsights = JSON.parse(localStorage.getItem("seenAIInsights") || "[]");
    const dismissedNotifications = JSON.parse(
      localStorage.getItem("dismissedNotifications") || "[]"
    );

    const todayStr = today.toISOString().split("T")[0];
    const followupTodayId = `followup-today-${todayStr}`;
    const followupOverdueId = `followup-overdue-${todayStr}`;

    const followUpsToday = leads.filter((lead) => {
      if (!lead.nextFollowUp || lead.status === "Converted" || lead.status === "Lost" || lead.status === "Contacted")
        return false;
      const followDate = new Date(lead.nextFollowUp);
      followDate.setHours(0, 0, 0, 0);
      return followDate.getTime() === today.getTime();
    });

    if (followUpsToday.length > 0 && !dismissedNotifications.includes(followupTodayId)) {
      newNotifications.push({
        id: followupTodayId,
        type: "FOLLOWUP_TODAY",
        title: "Follow-ups due today",
        message: `Follow-ups due today (${followUpsToday.length})`,
        link: "/follow-ups",
        priority: 2,
        icon: <FaCalendarCheck className="text-red-500" />,
        color: "text-red-500",
      });
    }

    const followUpsOverdue = leads.filter((lead) => {
      if (!lead.nextFollowUp || lead.status === "Converted" || lead.status === "Lost" || lead.status === "Contacted")
        return false;
      const followDate = new Date(lead.nextFollowUp);
      followDate.setHours(0, 0, 0, 0);
      return followDate.getTime() < today.getTime();
    });

    if (followUpsOverdue.length > 0 && !dismissedNotifications.includes(followupOverdueId)) {
      newNotifications.push({
        id: followupOverdueId,
        type: "FOLLOWUP_OVERDUE",
        title: "Overdue follow-ups",
        message: `Overdue follow-ups (${followUpsOverdue.length})`,
        link: "/follow-ups",
        priority: 3,
        icon: <FaCalendarTimes className="text-orange-500" />,
        color: "text-orange-500",
      });
    }

    const highPriorityLeads = leads.filter(
      (lead) => lead.leadScore === 5 && !seenHighPriority.includes(lead._id)
    );
    highPriorityLeads.forEach((lead) => {
      newNotifications.push({
        id: `high-priority-${lead._id}`,
        type: "HIGH_PRIORITY",
        title: "High-Priority Lead Detected",
        message: `High-priority lead: ${lead.businessName}`,
        link: `/leads/${lead._id}`,
        priority: 4,
        icon: <FaFire className="text-red-600" />,
        color: "text-red-600",
        leadId: lead._id,
      });
    });

    const aiInsightsLeads = leads.filter(
      (lead) => lead.aiSummary && !seenAIInsights.includes(lead._id)
    );
    aiInsightsLeads.forEach((lead) => {
      newNotifications.push({
        id: `ai-insights-${lead._id}`,
        type: "AI_INSIGHTS",
        title: "AI Analysis Completed",
        message: `AI insights ready for ${lead.businessName}`,
        link: `/leads/${lead._id}`,
        priority: 5,
        icon: <FaBrain className="text-purple-500" />,
        color: "text-purple-500",
        leadId: lead._id,
      });
    });

    const draftReadyLeads = leads.filter(
      (lead) =>
        (hasEmailDraft(lead) || hasWhatsAppDraft(lead)) &&
        !seenDrafts.includes(lead._id)
    );
    draftReadyLeads.forEach((lead) => {
      const draftType = hasEmailDraft(lead) ? "Email" : "WhatsApp";
      newNotifications.push({
        id: `draft-ready-${lead._id}`,
        type: "DRAFT_READY",
        title: "Draft Ready",
        message: `${draftType} draft ready for ${lead.businessName}`,
        link: `/leads/${lead._id}`,
        priority: 6,
        icon: <FaEnvelope className="text-blue-500" />,
        color: "text-blue-500",
        leadId: lead._id,
      });
    });

    setNotifications(newNotifications.sort((a, b) => a.priority - b.priority));

    try {
      const { unreadCount } = await getUnreadCount();
      const fallbackCount = newNotifications.filter(
        (n) =>
          !n.isDatabase &&
          (n.type === "DESIGN_APPROVED" || n.type === "CHANGE_REQUEST")
      ).length;
      setUnreadBadgeCount(unreadCount + fallbackCount);
    } catch {
      setUnreadBadgeCount(
        newNotifications.filter((n) => n.type === "DESIGN_APPROVED" || n.type === "CHANGE_REQUEST").length
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndProcessNotifications();
    const interval = setInterval(fetchAndProcessNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAndProcessNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchAndProcessNotifications();
    }
  }, [isOpen, fetchAndProcessNotifications]);

  const handleClearAll = async () => {
    for (const notification of notifications) {
      if (notification.isDatabase && !notification.isRead) {
        try {
          await markAsRead(notification.id);
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }
    }

    const seenHighPriority = JSON.parse(localStorage.getItem("seenHighPriority") || "[]");
    const seenDrafts = JSON.parse(localStorage.getItem("seenDrafts") || "[]");
    const seenAIInsights = JSON.parse(localStorage.getItem("seenAIInsights") || "[]");
    const seenDesignApprovals = JSON.parse(localStorage.getItem("seenDesignApprovals") || "[]");
    const seenChangeRequests = JSON.parse(localStorage.getItem("seenChangeRequests") || "[]");
    const dismissedNotifications = JSON.parse(
      localStorage.getItem("dismissedNotifications") || "[]"
    );

    notifications.forEach((notification) => {
      if (notification.type === "HIGH_PRIORITY" && notification.leadId) {
        if (!seenHighPriority.includes(notification.leadId))
          seenHighPriority.push(notification.leadId);
      } else if (notification.type === "DRAFT_READY" && notification.leadId) {
        if (!seenDrafts.includes(notification.leadId)) seenDrafts.push(notification.leadId);
      } else if (notification.type === "AI_INSIGHTS" && notification.leadId) {
        if (!seenAIInsights.includes(notification.leadId))
          seenAIInsights.push(notification.leadId);
      } else if (notification.type === "DESIGN_APPROVED" && notification.leadId) {
        if (!seenDesignApprovals.includes(notification.leadId))
          seenDesignApprovals.push(notification.leadId);
      } else if (notification.type === "CHANGE_REQUEST" && notification.leadId) {
        if (!seenChangeRequests.includes(notification.leadId))
          seenChangeRequests.push(notification.leadId);
      } else if (
        notification.type === "FOLLOWUP_TODAY" ||
        notification.type === "FOLLOWUP_OVERDUE"
      ) {
        if (!dismissedNotifications.includes(notification.id))
          dismissedNotifications.push(notification.id);
      }
    });

    localStorage.setItem("seenHighPriority", JSON.stringify(seenHighPriority));
    localStorage.setItem("seenDrafts", JSON.stringify(seenDrafts));
    localStorage.setItem("seenAIInsights", JSON.stringify(seenAIInsights));
    localStorage.setItem("seenDesignApprovals", JSON.stringify(seenDesignApprovals));
    localStorage.setItem("seenChangeRequests", JSON.stringify(seenChangeRequests));
    localStorage.setItem("dismissedNotifications", JSON.stringify(dismissedNotifications));

    fetchAndProcessNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.isDatabase && !notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.type === "DESIGN_APPROVED" && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem("seenDesignApprovals") || "[]");
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem(
          "seenDesignApprovals",
          JSON.stringify([...seen, notification.leadId])
        );
      }
    } else if (notification.type === "CHANGE_REQUEST" && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem("seenChangeRequests") || "[]");
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem(
          "seenChangeRequests",
          JSON.stringify([...seen, notification.leadId])
        );
      }
    } else if (notification.type === "HIGH_PRIORITY" && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem("seenHighPriority") || "[]");
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem("seenHighPriority", JSON.stringify([...seen, notification.leadId]));
      }
    } else if (notification.type === "DRAFT_READY" && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem("seenDrafts") || "[]");
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem("seenDrafts", JSON.stringify([...seen, notification.leadId]));
      }
    } else if (notification.type === "AI_INSIGHTS" && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem("seenAIInsights") || "[]");
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem("seenAIInsights", JSON.stringify([...seen, notification.leadId]));
      }
    }

    fetchAndProcessNotifications();
    closeDropdown();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadBadgeCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute left-0 right-auto mt-[17px] flex h-[480px] w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark 2xsm:w-[340px] xsm:w-[350px] sm:w-[361px] lg:right-0 lg:left-auto"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="p-4 text-center text-gray-500">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No new notifications</li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  tag="a"
                  to={notification.link}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    {notification.icon}
                  </span>

                  <span className="block">
                    <span className={`mb-1 block text-sm font-medium ${notification.color}`}>
                      {notification.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
