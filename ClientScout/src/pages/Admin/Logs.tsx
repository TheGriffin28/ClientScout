import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { TableSkeleton } from "../../components/ui/Skeleton";

interface LogEntry {
  _id: string;
  action: string;
  userId?: { name: string; email: string };
  adminId?: { name: string; email: string };
  details: any;
  timestamp: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchLogs();
  }, [page]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userId?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.adminId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof log.details === "string" ? log.details : JSON.stringify(log.details)).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchQuery, logs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLogs(page);
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "USER_SIGNUP": return "success";
      case "USER_DISABLED": return "error";
      case "USER_ENABLED": return "success";
      case "ROLE_CHANGE": return "warning";
      case "AI_ERROR": return "error";
      case "ADMIN_LOGIN": return "info";
      case "CONFIG_CHANGE": return "light";
      default: return "light";
    }
  };

  return (
    <>
      <PageMeta
        title="Admin Logs | ClientScout Admin"
        description="View platform activity logs"
      />
      <PageBreadCrumb pageTitle="Activity Logs" />

      <ComponentCard title="System Activity">
        <div className="overflow-x-auto">
          {loading && page === 1 ? (
            <TableSkeleton rows={10} cols={5} />
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.userId ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{log.userId.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{log.userId.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.adminId ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{log.adminId.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{log.adminId.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs overflow-hidden text-ellipsis">
                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </ComponentCard>
    </>
  );
};

export default AdminLogs;
