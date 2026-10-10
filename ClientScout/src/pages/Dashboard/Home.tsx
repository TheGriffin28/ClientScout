import { useEffect, useState } from "react";
import { getLeads, Lead } from "../../services/leadService";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { useUser } from "../../context/UserContext";
import LeadStatusChart from "../../components/dashboard/charts/LeadStatusChart";
import FollowUpChart from "../../components/dashboard/charts/FollowUpChart";
import ActivityChart from "../../components/dashboard/charts/ActivityChart";
import IndustryChart from "../../components/dashboard/charts/IndustryChart";
import ScoreDistributionChart from "../../components/dashboard/charts/ScoreDistributionChart";
import SourceChart from "../../components/dashboard/charts/SourceChart";
import { FiUsers, FiPhoneCall, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar, FiMapPin, FiMail, FiZap } from "react-icons/fi";
import { CardSkeleton, ChartSkeleton } from "../../components/ui/Skeleton";
import CardDataStats from "../../components/dashboard/CardDataStats";

export default function Home() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [statusData, setStatusData] = useState({ New: 0, Contacted: 0, FollowUp: 0, Interested: 0, Converted: 0, Lost: 0 });
  const [followUpData, setFollowUpData] = useState({ Overdue: 0, Today: 0, Upcoming: 0 });
  const [activityData, setActivityData] = useState<{ categories: string[], series: { name: string, data: number[] }[] }>({ categories: [], series: [] });
  const [leadsAnalyzed, setLeadsAnalyzed] = useState(0);
  const [avgLeadScore, setAvgLeadScore] = useState(0);
  const [industryData, setIndustryData] = useState<{ [key: string]: number }>({});
  const [scoreData, setScoreData] = useState({ Hot: 0, Warm: 0, Cold: 0 });
  const [sourceData, setSourceData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getLeads();
      const allLeads = Array.isArray(data) ? data : data.leads;
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
    const industries: { [key: string]: number } = {};
    const sources: { [key: string]: number } = {};
    const scores = { Hot: 0, Warm: 0, Cold: 0 };

    data.forEach(lead => {
      // Status
      if (statuses[lead.status] !== undefined) {
        statuses[lead.status]++;
      }

      // Analysis Stats
      if (lead.aiSummary || lead.leadScore) {
        analyzedCount++;
      }
      if (lead.leadScore) {
        totalLeadScore += lead.leadScore;
        scoredLeadCount++;
        
        // Score Distribution
        if (lead.leadScore >= 80) scores.Hot++;
        else if (lead.leadScore >= 40) scores.Warm++;
        else scores.Cold++;
      } else if (lead.scoreCategory) {
        // Fallback to category if score number not present
        if (lead.scoreCategory === 'Hot') scores.Hot++;
        else if (lead.scoreCategory === 'Warm') scores.Warm++;
        else scores.Cold++;
      }

      // Industries
      if (lead.industry) {
        industries[lead.industry] = (industries[lead.industry] || 0) + 1;
      }

      // Sources
      if (lead.source) {
        sources[lead.source] = (sources[lead.source] || 0) + 1;
      }
    });

    setStatusData(statuses);
    setLeadsAnalyzed(analyzedCount);
    setAvgLeadScore(scoredLeadCount > 0 ? parseFloat((totalLeadScore / scoredLeadCount).toFixed(1)) : 0);
    setIndustryData(industries);
    setScoreData(scores);
    setSourceData(sources);

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
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FiCalendar className="text-gray-500" />
            <span className="text-sm font-medium text-black dark:text-white">{currentDate}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <CardDataStats 
                title="New Leads" 
                total={statusData.New.toString()} 
                rate="12%"
                levelUp
                iconColorClass="bg-brand-500/15 dark:bg-brand-500/30 text-brand-500 dark:text-brand-400"
              >
                <FiUsers className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Contacted" 
                total={statusData.Contacted.toString()} 
                rate="5%"
                levelUp
                iconColorClass="bg-blue-500/15 dark:bg-blue-500/30 text-blue-500 dark:text-blue-400"
              >
                <FiPhoneCall className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Converted" 
                total={statusData.Converted.toString()} 
                rate="2.5%"
                levelUp
                iconColorClass="bg-green-500/15 dark:bg-green-500/30 text-green-500 dark:text-green-400"
              >
                <FiCheckCircle className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Follow-ups Today" 
                total={followUpData.Today.toString()} 
                rate="Due Today"
                levelDown={false}
                iconColorClass="bg-orange-500/15 dark:bg-orange-500/30 text-orange-500 dark:text-orange-400"
              >
                <FiClock className="text-xl" />
              </CardDataStats>
            </>
          )}
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <CardDataStats 
                title="Leads Analyzed" 
                total={leadsAnalyzed.toString()} 
                rate="AI Insights"
                levelUp
                iconColorClass="bg-purple-500/15 dark:bg-purple-500/30 text-purple-500 dark:text-purple-400"
              >
                <FiTrendingUp className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Avg Lead Score" 
                total={avgLeadScore.toString()} 
                rate="Out of 5"
                levelUp
                iconColorClass="bg-pink-500/15 dark:bg-pink-500/30 text-pink-500 dark:text-pink-400"
              >
                <FiZap className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Map Quota" 
                total={`${user?.mapSearchCount || 0}/${user?.maxMonthlyMapSearchesPerUser || 100}${user?.extraMapSearchCredits ? ` (+${user.extraMapSearchCredits})` : ''}`} 
                rate="Monthly searches"
                levelUp={false}
                iconColorClass="bg-indigo-500/15 dark:bg-indigo-500/30 text-indigo-500 dark:text-indigo-400"
              >
                <FiMapPin className="text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Email Quota" 
                total={`${user?.emailUsageCount || 0}/${user?.maxMonthlyEmailsPerUser || 100}${user?.extraEmailCredits ? ` (+${user.extraEmailCredits})` : ''}`} 
                rate="Monthly emails"
                levelUp={false}
                iconColorClass="bg-cyan-500/15 dark:bg-cyan-500/30 text-cyan-500 dark:text-cyan-400"
              >
                <FiMail className="text-xl" />
              </CardDataStats>
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          {loading ? (
            <>
              <div className="col-span-12">
                <ChartSkeleton />
              </div>
            </>
          ) : (
            <>
              {/* Row 1: Activity Chart (Wide) */}
              <ActivityChart categories={activityData.categories} series={activityData.series} />
              
              {/* Row 2: Status, Scores, Sources */}
              <LeadStatusChart data={statusData} />
              <ScoreDistributionChart data={scoreData} />
              <SourceChart data={sourceData} />

              {/* Row 3: Industry & FollowUps */}
              <IndustryChart data={industryData} />
              <div className="col-span-12 xl:col-span-6">
                 <FollowUpChart data={followUpData} />
              </div>
            </>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
