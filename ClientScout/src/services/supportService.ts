import api from "./api";

export const supportService = {
  sendSupportMessage: async (subject: string, message: string) => {
    const response = await api.post("/support/contact", { subject, message });
    return response.data;
  },
};
