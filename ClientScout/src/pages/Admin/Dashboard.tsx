import React, { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { adminService, UserStats, AIUsageResponse, DashboardChartsResponse } from "../../services/adminService";
import { toast } from "react-hot-toast";
import UsageChart from "./UsageChart";
import UserGrowthChart from "./UserGrowthChart";
import LeadStatusChart from "./LeadStatusChart";
import { CardSkeleton, ChartSkeleton } from "../../components/ui/Skeleton";
import { GroupIcon, BoxIconLine, BoltIcon, UserCircleIcon } from "../../icons";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<DashboardChartsResponse | null>(null);
  const [usageData, setUsageData] = useState<AIUsageResponse>({ 
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], 
    series: [{ name: "AI Usage", data: [0, 0, 0, 0, 0, 0, 0] }],
    topUsers: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, aiUsageData, chartsResponse] = await Promise.all([
        adminService.getStats(),
        adminService.getAIUsageData(),
        adminService.getChartsData()
      ]);
      
      setStats(statsData);
      if (aiUsageData && aiUsageData.categories && aiUsageData.series) {
        setUsageData(aiUsageData);
      }
      if (chartsResponse) {
        setChartData(chartsResponse);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Admin Dashboard | ClientScout"
        description="ClientScout Admin Dashboard"
      />
      <PageBreadCrumb pageTitle="Admin Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total Users */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Users</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {stats?.totalUsers || 0}
                </h4>
              </div>
            </div>

            {/* Active Users */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-500/10">
                <UserCircleIcon className="text-green-600 size-6" />
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Users</span>
                <h4 className="mt-2 font-bold text-green-600 text-title-sm">
                  {stats?.activeUsers || 0}
                </h4>
              </div>
            </div>

            {/* Total Leads */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-500/10">
                <BoxIconLine className="text-blue-600 size-6" />
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Leads</span>
                <h4 className="mt-2 font-bold text-blue-600 text-title-sm">
                  {stats?.totalLeads || 0}
                </h4>
              </div>
            </div>

            {/* AI Usage */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-500/10">
                <BoltIcon className="text-purple-600 size-6" />
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">AI Usage</span>
                <h4 className="mt-2 font-bold text-purple-600 text-title-sm">
                  {stats?.aiUsageCount || 0}
                </h4>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-6">
        {/* AI Usage Chart */}
        <div className="lg:col-span-8">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <UsageChart 
              categories={chartData?.categories || usageData.categories} 
              series={chartData ? [chartData.aiUsage] : usageData.series} 
            />
          )}
        </div>

        {/* Lead Distribution Chart */}
        <div className="lg:col-span-4">
          {loading ? (
            <ChartSkeleton />
          ) : (
            chartData && <LeadStatusChart data={chartData.leadDistribution} />
          )}
        </div>

        {/* User Growth Chart */}
        <div className="lg:col-span-12">
          {loading ? (
            <ChartSkeleton />
          ) : (
            chartData && (
              <UserGrowthChart 
                categories={chartData.categories} 
                data={chartData.userGrowth.data} 
              />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
