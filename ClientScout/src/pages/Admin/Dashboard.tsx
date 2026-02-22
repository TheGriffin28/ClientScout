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
import CardDataStats from "../../components/dashboard/CardDataStats";
import { FaMoneyBillWave, FaShoppingCart, FaChartLine } from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<DashboardChartsResponse | null>(null);
  const [usageData, setUsageData] = useState<AIUsageResponse>({ 
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], 
    series: [{ name: "AI Usage", data: [0, 0, 0, 0, 0, 0, 0] }],
    topUsers: []
  });
  const [transactionStats, setTransactionStats] = useState<{
    totalRevenue: number;
    pendingCount: number;
    todaySales: number;
    totalTransactions: number;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, aiUsageData, chartsResponse, transactionsData] = await Promise.all([
        adminService.getStats(),
        adminService.getAIUsageData(),
        adminService.getChartsData(),
        adminService.getTransactions(1, 1)
      ]);
      
      setStats(statsData);
      if (aiUsageData && aiUsageData.categories && aiUsageData.series) {
        setUsageData(aiUsageData);
      }
      if (chartsResponse) {
        setChartData(chartsResponse);
      }
      if (transactionsData && transactionsData.stats) {
        setTransactionStats(transactionsData.stats);
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
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
              title="Total Users" 
              total={stats?.totalUsers.toString() || "0"} 
              rate={`${stats?.activeUsers || 0} Active`} 
              levelUp={true}
            >
              <GroupIcon className="fill-primary dark:fill-white" />
            </CardDataStats>

            <CardDataStats 
              title="Total Revenue" 
              total={`$${transactionStats?.totalRevenue.toLocaleString() || "0"}`} 
              rate="All Time" 
              levelUp={true}
            >
              <FaMoneyBillWave className="text-primary dark:text-white text-xl" />
            </CardDataStats>

            <CardDataStats 
              title="Total Leads" 
              total={stats?.totalLeads.toString() || "0"} 
              rate="System Wide" 
              levelUp={true}
            >
              <BoxIconLine className="fill-primary dark:fill-white" />
            </CardDataStats>

            <CardDataStats 
              title="AI Usage" 
              total={stats?.aiUsageCount.toString() || "0"} 
              rate="Total Calls" 
              levelUp={true}
            >
              <BoltIcon className="fill-primary dark:fill-white" />
            </CardDataStats>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
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
                title="Today's Sales" 
                total={`$${transactionStats?.todaySales.toLocaleString() || "0"}`} 
                rate="Today"
                levelUp={true}
              >
                <FaChartLine className="text-primary dark:text-white text-xl" />
              </CardDataStats>

              <CardDataStats 
                title="Pending Trans." 
                total={transactionStats?.pendingCount.toString() || "0"} 
                rate="Action Needed"
                levelDown={transactionStats?.pendingCount ? transactionStats.pendingCount > 0 : false}
              >
                <FaShoppingCart className="text-primary dark:text-white text-xl" />
              </CardDataStats>
            </>
          )}
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
            {loading ? (
                <ChartSkeleton />
            ) : (
                <UsageChart 
                  categories={chartData?.categories || usageData.categories} 
                  series={chartData ? [chartData.aiUsage] : usageData.series} 
                />
            )}
        </div>
        
        <div className="col-span-12 xl:col-span-4">
             {loading ? (
                <ChartSkeleton />
            ) : (
                chartData && <LeadStatusChart data={chartData.leadDistribution} />
            )}
        </div>

        <div className="col-span-12">
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
