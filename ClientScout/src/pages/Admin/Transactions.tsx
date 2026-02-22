import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-hot-toast";
import { 
  FaSearch, 
  FaFilter, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaRupeeSign, 
  FaChartLine,
  FaShoppingCart,
  FaExclamationCircle
} from "react-icons/fa";

interface Transaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  type: string;
  amount: number;
  credits: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  currency: string;
  createdAt: string;
}

interface Stats {
  totalRevenue: number;
  pendingCount: number;
  todaySales: number;
  totalTransactions: number;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    pendingCount: 0,
    todaySales: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTransactions(page, 10, debouncedSearch, statusFilter);
      setTransactions(data.transactions);
      setTotalPages(data.pages);
      setPage(data.page);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, debouncedSearch, statusFilter]);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this transaction? Credits will be added to the user.")) return;
    
    setActionLoading(id);
    try {
      await adminService.updateTransactionStatus(id, "completed");
      toast.success("Transaction approved and credits added");
      fetchTransactions();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve transaction");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
            <FaCheckCircle className="text-xs" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
            <FaClock className="text-xs" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400">
            <FaTimesCircle className="text-xs" /> Failed
          </span>
        );
      default:
        return <span className="text-gray-500 dark:text-gray-400">{status}</span>;
    }
  };

  return (
    <>
      <PageMeta
        title="Transaction History | ClientScout Admin"
        description="View purchase history and transaction details."
      />
      <PageBreadcrumb pageTitle="Transactions" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
        <div className="rounded-sm border border-gray-200 bg-white px-7.5 py-6 shadow-default dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <FaRupeeSign className="fill-brand-500 dark:fill-white text-xl text-brand-500 dark:text-white" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                ₹{stats.totalRevenue.toLocaleString()}
              </h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white px-7.5 py-6 shadow-default dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <FaChartLine className="fill-brand-500 dark:fill-white text-xl text-brand-500 dark:text-white" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                ₹{stats.todaySales.toLocaleString()}
              </h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Sales</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white px-7.5 py-6 shadow-default dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <FaExclamationCircle className="fill-brand-500 dark:fill-white text-xl text-brand-500 dark:text-white" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {stats.pendingCount}
              </h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white px-7.5 py-6 shadow-default dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <FaShoppingCart className="fill-brand-500 dark:fill-white text-xl text-brand-500 dark:text-white" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {stats.totalTransactions}
              </h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-sm border border-gray-200 bg-white px-5 pb-5 pt-6 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Recent Transactions
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID or User..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-black focus:border-brand-500 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-40 rounded border border-gray-200 bg-gray-50 px-4 py-2 text-black focus:border-brand-500 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <FaFilter className="absolute right-3 top-3 text-gray-500 pointer-events-none dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left dark:bg-gray-700">
                <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  User
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Package
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Amount
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Transaction ID
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id}>
                    <td className="border-b border-gray-200 px-4 py-5 pl-9 dark:border-gray-700 xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {txn.user?.name || "Unknown"}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{txn.user?.email}</p>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-black dark:text-white capitalize">
                          {txn.type === "ai" ? "AI Calls" : txn.type === "map" ? "Map Search" : "Email Search"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">+{txn.credits} Credits</span>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      <p className="font-medium text-black dark:text-white">
                        {txn.currency === "INR" ? "₹" : "$"}{txn.amount}
                      </p>
                      <p className="text-xs text-gray-500 uppercase dark:text-gray-400">{txn.paymentMethod}</p>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded select-all text-black dark:text-white">
                        {txn.transactionId}
                      </span>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-black dark:text-white">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                      {txn.status === "pending" && (
                        <button
                          onClick={() => handleApprove(txn._id)}
                          disabled={actionLoading === txn._id}
                          className="inline-flex items-center justify-center rounded bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 text-sm"
                        >
                          {actionLoading === txn._id ? "..." : "Approve"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded border border-gray-200 bg-gray-100 hover:bg-opacity-90 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-opacity-90"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded border border-gray-200 bg-gray-100 hover:bg-opacity-90 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-opacity-90"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transactions;
