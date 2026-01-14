
import { useEffect, useState } from "react";
import { getLeads, Lead } from "../../services/leadService";
import PrivateRoute from "../../components/auth/PrivateRoute";
import LeadStatusChart from "../../components/dashboard/charts/LeadStatusChart";
import FollowUpChart from "../../components/dashboard/charts/FollowUpChart";
import ActivityChart from "../../components/dashboard/charts/ActivityChart";
import { FiUsers, FiPhoneCall, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar } from "react-icons/fi";

export default function Home() {
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [statusData, setStatusData] = useState({ New: 0, Contacted: 0, FollowUp: 0, Interested: 0, Converted: 0, Lost: 0 });
  const [followUpData, setFollowUpData] = useState({ Overdue: 0, Today: 0, Upcoming: 0 });
  const [activityData, setActivityData] = useState<{ categories: string[], series: { name: string, data: number[] }[] }>({ categories: [], series: [] });
  const [leadsAnalyzed, setLeadsAnalyzed] = useState(0);
  const [avgLeadScore, setAvgLeadScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allLeads = await getLeads();
      processData(allLeads);
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data: Lead[]) => {
    // 1. Status Breakdown
    const statuses: any = { New: 0, Contacted: 0, FollowUp: 0, Interested: 0, Converted: 0, Lost: 0 };
    let analyzedCount = 0;
    let totalLeadScore = 0;
    let scoredLeadCount = 0;

    data.forEach(lead => {
      if (statuses[lead.status] !== undefined) {
        statuses[lead.status]++;
      }
      if (lead.aiSummary || lead.leadScore) {
        analyzedCount++;
      }
      if (lead.leadScore) {
        totalLeadScore += lead.leadScore;
        scoredLeadCount++;
      }
    });
    setStatusData(statuses);
    setLeadsAnalyzed(analyzedCount);
    setAvgLeadScore(scoredLeadCount > 0 ? parseFloat((totalLeadScore / scoredLeadCount).toFixed(1)) : 0);

    // 2. Follow-ups Timeline
    const followUps = { Overdue: 0, Today: 0, Upcoming: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    data.forEach(lead => {
      if (lead.nextFollowUp) {
        const followDate = new Date(lead.nextFollowUp);
        followDate.setHours(0, 0, 0, 0);
        
        if (followDate < today) {
          followUps.Overdue++;
        } else if (followDate.getTime() === today.getTime()) {
          followUps.Today++;
        } else {
          followUps.Upcoming++;
        }
      }
    });
    setFollowUpData(followUps);

    // 3. Weekly Activity (Last 8 weeks)
    const weeks = 8;
    const activityMap = new Map<string, { added: number, contacted: number }>();
    const now = new Date();
    
    // Helper to get Monday of the week
    const getStartOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    // Initialize last 8 weeks
    const currentWeekStart = getStartOfWeek(now);
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() - (i * 7));
      const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      activityMap.set(label, { added: 0, contacted: 0 });
    }

    const weekKeys = Array.from(activityMap.keys());

    data.forEach(lead => {
      // Leads Added
      const created = new Date(lead.createdAt);
      const createdWeekStart = getStartOfWeek(created);
      const createdLabel = `${createdWeekStart.getDate()} ${createdWeekStart.toLocaleString('default', { month: 'short' })}`;
      
      if (activityMap.has(createdLabel)) {
        activityMap.get(createdLabel)!.added++;
      }
      
      // Contacts Made (Approximation: UpdatedAt for non-New leads)
      if (lead.status !== 'New') {
        const updated = new Date(lead.updatedAt);
        const updatedWeekStart = getStartOfWeek(updated);
        const updatedLabel = `${updatedWeekStart.getDate()} ${updatedWeekStart.toLocaleString('default', { month: 'short' })}`;
        
        if (activityMap.has(updatedLabel)) {
           activityMap.get(updatedLabel)!.contacted++;
        }
      }
    });

    setActivityData({
      categories: weekKeys,
      series: [
        { name: 'Leads Added', data: weekKeys.map(k => activityMap.get(k)!.added) },
        { name: 'Contacts Made', data: weekKeys.map(k => activityMap.get(k)!.contacted) }
      ]
    });
  };

  if (loading) {
    return (
      <PrivateRoute>
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-boxdark-2">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </PrivateRoute>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PrivateRoute>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here's what's happening with your leads today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <FiCalendar className="text-gray-500" />
            <span className="text-sm font-medium text-black dark:text-white">{currentDate}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8">
          <CardDataStats 
            title="New Leads" 
            total={statusData.New.toString()} 
            type="new"
            trend="+12%"
            trendUp={true}
          />
          <CardDataStats 
            title="Contacted" 
            total={statusData.Contacted.toString()} 
            type="contacted" 
            trend="+5%"
            trendUp={true}
          />
          <CardDataStats 
            title="Converted" 
            total={statusData.Converted.toString()} 
            type="converted" 
            trend="+2.5%"
            trendUp={true}
          />
          <CardDataStats 
            title="Follow-ups Today" 
            total={followUpData.Today.toString()} 
            type="followup" 
            trend="Due today"
            trendUp={false}
          />
          <CardDataStats 
            title="Leads Analyzed" 
            total={leadsAnalyzed.toString()} 
            type="analyzed"
            trend="AI Insights"
            trendUp={true}
          />
          <CardDataStats 
            title="Avg Lead Score" 
            total={avgLeadScore.toString()} 
            type="score"
            trend="Out of 5"
            trendUp={true}
          />
          <CardDataStats 
            title="Contacted Leads" 
            total={statusData.Contacted.toString()} 
            type="contacted_count"
            trend="Total outreach"
            trendUp={true}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <LeadStatusChart data={statusData} />
          <FollowUpChart data={followUpData} />
          <ActivityChart categories={activityData.categories} series={activityData.series} />
        </div>
      </div>
    </PrivateRoute>
  );
}

// Modern Card Component for KPIs
const CardDataStats = ({ title, total, type, trend, trendUp }: { title: string; total: string; type: string; trend?: string; trendUp?: boolean }) => {
  let Icon = FiUsers;
  let colorClass = "text-primary bg-primary/10";
  
  if (type === 'contacted') {
    Icon = FiPhoneCall;
    colorClass = "text-blue-500 bg-blue-500/10";
  } else if (type === 'converted') {
    Icon = FiCheckCircle;
    colorClass = "text-green-500 bg-green-500/10";
  } else if (type === 'followup') {
    Icon = FiClock;
    colorClass = "text-orange-500 bg-orange-500/10";
  } else if (type === 'analyzed') {
    Icon = FiTrendingUp; // Using FiTrendingUp for AI insights
    colorClass = "text-purple-500 bg-purple-500/10";
  } else if (type === 'score') {
    Icon = FiTrendingUp; // Using FiTrendingUp for score
    colorClass = "text-pink-500 bg-pink-500/10";
  } else if (type === 'contacted_count') {
    Icon = FiPhoneCall; // Reusing FiPhoneCall for contacted count
    colorClass = "text-blue-500 bg-blue-500/10";
  }

  return (
    <div className="group relative rounded-xl border border-stroke bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-500' : 'text-orange-500'}`}>
            <span>{trend}</span>
            {trendUp && <FiTrendingUp size={14} />}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-3xl font-bold text-black dark:text-white group-hover:text-primary transition-colors">
          {total}
        </h4>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
      </div>
    </div>
  );
};
