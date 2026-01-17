import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getLeads } from "../../services/leadService";
import { FaCalendarCheck, FaCalendarTimes, FaFire, FaBrain, FaEnvelope } from "react-icons/fa";

type NotificationType =
  | 'FOLLOWUP_TODAY'
  | 'FOLLOWUP_OVERDUE'
  | 'AI_INSIGHTS'
  | 'HIGH_PRIORITY'
  | 'DRAFT_READY';

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
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndProcessNotifications();
    // Poll for notifications every 5 minutes
    const interval = setInterval(fetchAndProcessNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAndProcessNotifications = async () => {
    try {
      setLoading(true);
      const leads = await getLeads();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newNotifications: Notification[] = [];
      const seenHighPriority = JSON.parse(localStorage.getItem('seenHighPriority') || '[]');
      const seenDrafts = JSON.parse(localStorage.getItem('seenDrafts') || '[]');
      const seenAIInsights = JSON.parse(localStorage.getItem('seenAIInsights') || '[]');

      // 1. Follow-ups Due Today
      const followUpsToday = leads.filter(lead => {
        if (!lead.nextFollowUp || lead.status === 'Converted' || lead.status === 'Lost' || lead.status === 'Contacted') return false;
        const followDate = new Date(lead.nextFollowUp);
        followDate.setHours(0, 0, 0, 0);
        return followDate.getTime() === today.getTime();
      });

      if (followUpsToday.length > 0) {
        newNotifications.push({
          id: 'followup-today',
          type: 'FOLLOWUP_TODAY',
          title: 'Follow-ups due today',
          message: `🔔 Follow-ups due today (${followUpsToday.length})`,
          link: '/follow-ups',
          priority: 1,
          icon: <FaCalendarCheck className="text-red-500" />,
          color: 'text-red-500',
        });
      }

      // 2. Overdue Follow-ups
      const followUpsOverdue = leads.filter(lead => {
        if (!lead.nextFollowUp || lead.status === 'Converted' || lead.status === 'Lost' || lead.status === 'Contacted') return false;
        const followDate = new Date(lead.nextFollowUp);
        followDate.setHours(0, 0, 0, 0);
        return followDate.getTime() < today.getTime();
      });

      if (followUpsOverdue.length > 0) {
        newNotifications.push({
          id: 'followup-overdue',
          type: 'FOLLOWUP_OVERDUE',
          title: 'Overdue follow-ups',
          message: `⚠️ Overdue follow-ups (${followUpsOverdue.length})`,
          link: '/follow-ups',
          priority: 2,
          icon: <FaCalendarTimes className="text-orange-500" />,
          color: 'text-orange-500',
        });
      }

      // 3. High-Priority Leads (AI score = 5)
      const highPriorityLeads = leads.filter(lead => lead.leadScore === 5 && !seenHighPriority.includes(lead._id));
      highPriorityLeads.forEach(lead => {
        newNotifications.push({
          id: `high-priority-${lead._id}`,
          type: 'HIGH_PRIORITY',
          title: 'High-Priority Lead Detected',
          message: `🔥 High-priority lead: ${lead.businessName}`,
          link: `/leads/${lead._id}`,
          priority: 3,
          icon: <FaFire className="text-red-600" />,
          color: 'text-red-600',
          leadId: lead._id
        });
      });

      // 4. AI Insights Ready
      const aiInsightsLeads = leads.filter(lead => lead.aiSummary && !seenAIInsights.includes(lead._id));
      aiInsightsLeads.forEach(lead => {
        newNotifications.push({
          id: `ai-insights-${lead._id}`,
          type: 'AI_INSIGHTS',
          title: 'AI Analysis Completed',
          message: `🧠 AI insights ready for ${lead.businessName}`,
          link: `/leads/${lead._id}`,
          priority: 4,
          icon: <FaBrain className="text-purple-500" />,
          color: 'text-purple-500',
          leadId: lead._id
        });
      });

      // 5. Draft Ready
      const draftReadyLeads = leads.filter(lead => (lead.emailDraft || lead.whatsappDraft) && !seenDrafts.includes(lead._id));
      draftReadyLeads.forEach(lead => {
        const draftType = lead.emailDraft ? 'Email' : 'WhatsApp';
        newNotifications.push({
          id: `draft-ready-${lead._id}`,
          type: 'DRAFT_READY',
          title: 'Draft Ready',
          message: `✉️ ${draftType} draft ready for ${lead.businessName}`,
          link: `/leads/${lead._id}`,
          priority: 5,
          icon: <FaEnvelope className="text-blue-500" />,
          color: 'text-blue-500',
          leadId: lead._id
        });
      });

      setNotifications(newNotifications.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'HIGH_PRIORITY' && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem('seenHighPriority') || '[]');
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem('seenHighPriority', JSON.stringify([...seen, notification.leadId]));
      }
    } else if (notification.type === 'DRAFT_READY' && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem('seenDrafts') || '[]');
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem('seenDrafts', JSON.stringify([...seen, notification.leadId]));
      }
    } else if (notification.type === 'AI_INSIGHTS' && notification.leadId) {
      const seen = JSON.parse(localStorage.getItem('seenAIInsights') || '[]');
      if (!seen.includes(notification.leadId)) {
        localStorage.setItem('seenAIInsights', JSON.stringify([...seen, notification.leadId]));
      }
    }
    
    // Refresh notifications after marking as seen
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
        {notifications.length > 0 && (
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
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
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
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800`}>
                    {notification.icon}
                  </span>

                  <span className="block">
                    <span className={`mb-1 block text-sm font-medium ${notification.color}`}>
                      {notification.message}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.title}
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
