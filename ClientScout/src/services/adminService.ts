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

  getAIUsageData: async (): Promise<any> => {
    const response = await api.get("/admin/ai-usage");
    return response.data;
  },

  getConfigs: async (): Promise<any[]> => {
    const response = await api.get("/admin/config");
    return response.data;
  },

  updateConfig: async (key: string, value: any): Promise<void> => {
    await api.patch(`/admin/config/${key}`, { value });
  },

  getLogs: async (page = 1, limit = 20): Promise<any> => {
    const response = await api.get(`/admin/logs?page=${page}&limit=${limit}`);
    return response.data;
  },
};
