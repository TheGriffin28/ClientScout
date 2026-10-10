import api from "./api";

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalLeads: number;
  aiUsageCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
  aiUsageCount: number;
  lastLoginAt?: string;
  lastAIUsedAt?: string;
  maxMonthlyEmailsPerUser?: number | null;
  maxMonthlyAICallsPerUser?: number | null;
  mapSearchCount?: number;
  lastMapSearchAt?: string;
  maxMonthlyMapSearchesPerUser?: number | null;
  extraEmailCredits?: number;
  extraAICallsCredits?: number;
  extraMapSearchCredits?: number;
}

export interface AIUsageResponse {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
  topUsers: any[];
}

export interface DashboardChartsResponse {
  categories: string[];
  userGrowth: {
    name: string;
    data: number[];
  };
  aiUsage: {
    name: string;
    data: number[];
  };
  leadDistribution: {
    status: string;
    count: number;
  }[];
}

export const adminService = {
  getStats: async (): Promise<UserStats> => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await api.patch(`/admin/users/${userId}/status`, { isActive });
  },

  updateUserRole: async (userId: string, role: "admin" | "user"): Promise<void> => {
    await api.patch(`/admin/users/${userId}/role`, { role });
  },

  updateUserLimits: async (userId: string, limits: { maxMonthlyEmailsPerUser?: number | null; maxMonthlyAICallsPerUser?: number | null; maxMonthlyMapSearchesPerUser?: number | null; extraEmailCredits?: number; extraAICallsCredits?: number; extraMapSearchCredits?: number }): Promise<void> => {
    await api.patch(`/admin/users/${userId}/limits`, limits);
  },

  getAIUsageData: async (): Promise<AIUsageResponse> => {
    const response = await api.get("/admin/ai-usage");
    return response.data;
  },

  getChartsData: async (): Promise<DashboardChartsResponse> => {
    const response = await api.get("/admin/charts");
    return response.data;
  },

  getConfigs: async (): Promise<any[]> => {
    const response = await api.get("/admin/config");
    return response.data;
  },

  updateConfig: async (key: string, value: any): Promise<void> => {
    await api.patch(`/admin/config/${key}`, { value });
  },

  uploadQRCode: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("qrCode", file);
    const response = await api.post("/admin/upload-qr", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getAdminLogs(page = 1, limit = 20) {
    const response = await api.get(`/admin/logs?page=${page}&limit=${limit}`);
    return response.data;
  },

  getTransactions: async (page = 1, limit = 10, search = "", status = "all"): Promise<{
    transactions: any[];
    page: number;
    pages: number;
    total: number;
    stats: {
      totalRevenue: number;
      pendingCount: number;
      todaySales: number;
      totalTransactions: number;
    }
  }> => {
    const response = await api.get(`/admin/transactions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`);
    return response.data;
  },

  updateTransactionStatus: async (id: string, status: "completed" | "failed"): Promise<any> => {
    const response = await api.put(`/admin/transactions/${id}/status`, { status });
    return response.data;
  }
};

export default adminService;
