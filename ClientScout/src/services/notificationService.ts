import api from "./api";

export interface Notification {
  _id: string;
  user: string;
  lead:
    | string
    | {
        _id: string;
        businessName: string;
      }
    | null;
  type: "design_approved" | "change_request";
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (
  unreadOnly = false
): Promise<Notification[]> => {
  const res = await api.get("/notifications", {
    params: unreadOnly ? { unreadOnly: "true" } : undefined,
  });
  return res.data;
};

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const res = await api.get("/notifications/unread/count");
  return res.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
